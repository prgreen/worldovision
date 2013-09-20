$(function() {
    var socket = io.connect(window.location.hostname);
    
    var picList = [];
    var NBPICS = 8;

    function updatePics() {
      $('#pictures').html('');
      for (var i=0 ; i < picList.length-1 ; i++) {
        $('#pictures').append('<a href="' + picList[i] + ':large" target="_blank"><img src="' + picList[i] + ':thumb"></a>');
      }
      $('#big-picture').html('<img src="' + picList[picList.length-1] + ':large">');
    }

    socket.on('data', function(data) {
        if(data instanceof Array) {
            picList = data;
            picList.splice(0, picList.length - NBPICS);
        } else {
            if (picList.length >= NBPICS) {
                picList.splice(0, 1); //remove first element
            }
            picList.push(data);
        }
       updatePics(); 
    });
});

