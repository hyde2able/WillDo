var app = require('../../app');
var http = require('http').Server(app);
var io = require('socket.io')(http);

function skio() {
  // Socket.IO
 http.listen(app.get('port'), function() {
      console.log('listening!!!');
  });

 io.on('connection', function(socket){
        socket.on('chat message', function(msg){
            console.log('message: ' + msg);
            io.emit('chat message', msg);
      });
  });
}

module.exports = skio;