// Empty JS for your own code to be here
$(function(){

	// アラートはゆっくり順番にけす。
  	setTimeout( function() {
  		$('.alert').each( function(idx, element) {
 			setTimeout( function(){
 				$(element).fadeOut('slow');
 			}, 400 * idx);
 		});
  	}, 3000);


  	// ここでクリックを検知して画面遷移せず　Ajax　で表示できるように？
  	$('#search-btn').click( function() {
  		var address = $(this).closest("#address").val();
  		socket.emit("message", address + 'を入力したよ');
  	});


  	// イベントとコールバックの定義
  	var socket = io.connect();
  	socket.on('connect', function() {
  		console.log('つながったよーこれはクライアント側');
  		socket.on('message', function(message) {
  			console.log(message + "を受診したよ。クライアント側");
  		});
  	});

});