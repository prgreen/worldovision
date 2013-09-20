// modules
var express = require('express')
  , io = require('socket.io')
  , http = require('http')
  , twitter = require('ntwitter')
  , cronJob = require('cron').CronJob
  , _ = require('underscore')
  , path = require('path');

// create http server
var app = express();
var server = http.createServer(app);
 
// options
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public'))); 
app.use('/components', express.static(path.join(__dirname, 'components')));
 
var NPICS = 10;

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var picList = [];

// routes
app.get('/', function(req, res) {
    res.render('index', { data: picList });
});

// socket.io server
var sio = io.listen(server);
 
sio.sockets.on('connection', function(socket) { 
    socket.emit('data', _.last(picList, NPICS));
});

// twitter streamer
var t = new twitter({
    consumer_key: 'USE_YOUR_OWN',           
    consumer_secret: 'USE_YOUR_OWN',        
    access_token_key: 'USE_YOUR_OWN', 
    access_token_secret: 'USE_YOUR_OWN'
});
 
t.stream('statuses/filter', { locations : '-122.75,36.8,-121.75,37.8' }, function(stream) {
  stream.on('data', function(tweet) {
    if (tweet.text !== undefined) {
        //console.log(tweet.text+'\n');
        if (tweet.entities != undefined && tweet.entities.media != undefined && tweet.entities.media[0].media_url != undefined) {

            picList.push(tweet.entities.media[0].media_url);
            console.log(picList.length);
            sio.sockets.emit('data', _.last(picList));
        }
      }
    });
});

new cronJob('0 */20 * * * *', function(){
    picList = [];
}, null, true);



//Create the server
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

