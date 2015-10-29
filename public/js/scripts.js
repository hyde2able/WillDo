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

  	});

  	var socket = io();

  	$('.form').submit(function() {
  		socket.emit('chat message', $('#m').val);
  		$('#m').val('');
  		return false;
  	});

});