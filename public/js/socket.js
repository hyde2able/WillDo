// クライアント側のsocket
$(function(){
	var socket = io.connect();
	// socket.emit('sample', )

	socket.on('connect', function() {
	socket.on('sample', function(msg) {
		console.log('msg' + 'を受け取ったよ　サーバーから');
		$('#messages').append(msg);
	});

	// 天気情報を受け取る
	socket.on('weather', function(json) {
		console.log(JSON.stringify(json));
		$('#messages').append(JSON.stringify(json));
	});

	// BarNaviのjsonを受け取る
	socket.on('barnavi', function(json) {
		$('#messages').append(JSON.stringify(json));
	});

	// BarNaviのjsonを受け取る
	socket.on('gnavi', function(json) {
		$('#messages').append(JSON.stringify(json));
	});

	// BarNaviのjsonを受け取る
	socket.on('canpas', function(json) {
		$('#messages').append(JSON.stringify(json));
	});

	// BarNaviのjsonを受け取る
	socket.on('gourmet', function(json) {
		$('#messages').append(JSON.stringify(json));
	});

	// BarNaviのjsonを受け取る
	socket.on('place', function(json) {
		$('#messages').append(JSON.stringify(json));
	});

});



});