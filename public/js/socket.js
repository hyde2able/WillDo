// クライアント側のsocket
$(function(){
	// 受け取ったJSONを元に専用のwilldoを生成するメソッド
	function createWillDo(hash, cb) {
		var content = '<div class="caption">';
		for(type in hash) {
			content += '<p>' + hash[type] + '</p>';
		}
		content += '<p><a class="btn btn-primary" href="#">Action</a></p></div>';

		var $willdo = $("<div></div>", {
			css: { display: 'none' },
			addClass: 'col-md-4 col-sm-6 col-xs-10',
			on: {
				click: SearchRoot()
			}
		});
		$('<div></div>', {
			addClass: 'thumbnail',
			html: content
		}).appendTo($willdo);

		cb($willdo);
	};

	// 受け取ったwilldoを#willdosにアニメーションで追加してさらに場所はランダムに追加する
	function addWillDo($willdo) {
		$willdo.appendTo($('#willdos'));
		var speed = ['slow', 'normal','fast'][(Math.round( Math.random()*2))];
		$willdo.fadeIn(speed);
	};



	// willdoをクリックしたらそこまでの道のりを検索して表示
	function SearchRoot() {

	};


	$('#willdo').on('click', function() {
		//SearchRoot;
		alert( $(this).text() );
	});


	var socket = io.connect();
	// socket.emit('sample', )

	socket.on('connect', function() {

	});

	// 天気情報を受け取る
	socket.on('weather', function(json) {
		console.log(JSON.stringify(json));
		$('#messages').append(JSON.stringify(json));
	});


	// BarNaviのjsonを受け取る
	socket.on('barnavi', function(json) {
		$('#willdos').append('<h1>BAR</h1><p>' + JSON.stringify(json) + '</p>');
	});

	// BarNaviのjsonを受け取る
	socket.on('gnavi', function(json) {
		var image = json.photo.pc.l;
		var name = json.name;

		$('#willdos').append('<h1>GNavi</h1><p>' + JSON.stringify(json) + '</p>');
	});

	// BarNaviのjsonを受け取る
	socket.on('campus', function(json) {
		$('#willdos').append('<h1>Campus</h1><p>' + JSON.stringify(json) + '</p>');
	});

	// BarNaviのjsonを受け取る
	socket.on('gourmet', function(json) {
		$('#willdos').append('<h1>Gourmet</h1><p>' + JSON.stringify(json) + '</p>');
	});

	// BarNaviのjsonを受け取る
	socket.on('place', function(json) {
		var hash = {};
		hash.name = json.Name;
		hash.category = json.Category;
		hash.where = json.Where;
		createWillDo(hash, function($willdo) {
			addWillDo($willdo);

			//$willdo.appendTo($('#willdos'));
			//$('#willdos').append($willdo);
		});
	});

});