// クライアント側のsocket
$(function(){
	var socket = io.connect();
	// socket.emit('sample', )

	socket.on('sample', function(msg) {
		console.log('msg' + 'を受け取ったよ　サーバーから');
		$('#messages').append(msg);
	})

	socket.on('connect', function() {
		console.log('クライアントもつながったよー');
		socket.emit('sample', 'sample');

  		socket.on('sample', function(msg) {
  			console.log(msg+'をサーバから受信');
  		});
	});



});