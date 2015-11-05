// クライアント側のsocket
$(function(){
	var socket = io.connect();
	// socket.emit('sample', )

	socket.on('connect', function() {
		$('#a').append('<h1>繋がったよ！！</h1>');

	});

	// 天気情報を受け取る
	socket.on('weather', function(json) {
		console.log(JSON.stringify(json));
		$('#messages').append(JSON.stringify(json));
	});

	// BarNaviのjsonを受け取る
	socket.on('barnavi', function(json) {
		$('#messages').append('<h1>BAR</h1><p>' + JSON.stringify(json) + '</p>');
	});

	// BarNaviのjsonを受け取る
	socket.on('gnavi', function(json) {
		$('#messages').append('<h1>GNavi</h1><p>' + JSON.stringify(json) + '</p>');
	});

	// BarNaviのjsonを受け取る
	socket.on('campus', function(json) {
		$('#messages').append('<h1>Campus</h1><p>' + JSON.stringify(json) + '</p>');
	});

	// BarNaviのjsonを受け取る
	socket.on('gourmet', function(json) {
		$('#messages').append('<h1>Gourmet</h1><p>' + JSON.stringify(json) + '</p>');
	});

	// BarNaviのjsonを受け取る
	socket.on('place', function(json) {
		$('#messages').append('<h1>Place</h1><p>' + JSON.stringify(json) + '</p>');
	});

	socket.on('a', function(json) {
		$('#a').append('<p>'+ JSON.stringify(json) + '</p>');
	});




});