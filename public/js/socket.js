// クライアント側のsocket
$(function(){

	// 受け取ったJSONを元に専用のwilldoを生成するメソッド
	function createWillDo(hash, cb) {
		var content = '<div class="caption">';

		var $willdo = $("<div></div>", {
			css: { display: 'none' },
			id: 'willdo',
			addClass: 'willdo col-md-4 col-sm-6 col-xs-10'
		});

		for(type in hash) {
			switch(type){
				case "image":
					content += '<img alt="' + hash.name + '" class="img-thumbnail text-center" src="' + hash[type] + '" />'; break;
				case "lat": case "lng":
					$willdo.attr(type, hash[type]); break;
				case "url":
					content += '<a href="' + hash[type] + '" target="_blank" >URLだよん</a>';
				default:
					content += '<p class="' + type + '">' + hash[type] + '</p>'; break;
			}
		}
		content += '<p><a class="btn btn-primary" href="#">Action</a></p></div>';

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


	$(document).on("click", "#willdo", (function(){
    	var lat = $(this).attr('lat'),
    		lng = $(this).attr('lng');

	}));



	/*
		クライアント側のsocket.ioの受信設定。
	*/

	var socket = io.connect();

	socket.on('connect', function() {

	});

	// 天気情報を受け取る
	socket.on('weather', function(json) {
		console.log(JSON.stringify(json));
		$('#messages').append(JSON.stringify(json));
	});


	// BarNaviのjsonを受け取る
	socket.on('barnavi', function(json) {
		var willdo = {
			name: json.name,
			lat: json.lat_world,
			lng: json.lng_world,
			address: json.address,
			open: json.open,
			budget: json.budget,
			url: json.url_pc,
			access: json.access,
			genre: json.type
		}
		if(json.url_photo_l1){ willdo.image = json.url_photo_l1; }
		createWillDo(willdo, function($willdo) {
			addWillDo($willdo);
		});

	});

	// BarNaviのjsonを受け取る
	socket.on('gnavi', function(json) {
		var willdo = {
			image: json.photo.pc.l,
			name: json.name,
			lat: json.lat,
			lng: json.lng,
			address: json.address,
			open: json.open,
			budget: json.budget.average,
			url: json.urls.pc,
			access: json.mobile_access,
			genre: json.genre.name + "(" + json.genre.catch + ")"
		};
		console.log(JSON.stringify(willdo));
		// createWillDo(willdo, function($willdo) {
		// 	addWillDo($willdo);
		// });
	});

	// BarNaviのjsonを受け取る
	socket.on('campus', function(json) {
		$('#willdos').append('<h1>Campus</h1><p>' + JSON.stringify(json) + '</p>');
	});

	// BarNaviのjsonを受け取る
	socket.on('gourmet', function(json) {
		var willdo = {
			image: json.photo.pc.l,
			name: json.name,
			lat: json.lat,
			lng: json.lng,
			address: json.address,
			open: json.open,
			budget: json.budget.average,
			url: json.urls.pc,
			access: json.mobile_access,
			genre: json.genre.name + "(" + json.genre.catch + ")"
		};

		createWillDo(willdo, function($willdo) {
			addWillDo($willdo);
		});
	});

	// BarNaviのjsonを受け取る
	socket.on('place', function(json) {
		var willdo = {
			name: json.Name,
			category: json.category,
			where: json.Where
		};

		createWillDo(willdo, function($willdo) {
			addWillDo($willdo);
		});
	});

	// FourSquareのjsonを受け取る
	socket.on('foursquare', function(json) {
		var willdo = {
			name: json.name,
			lat: json.location.lat,
			lng: json.location.lng,
			// カテゴリーが複数あれば一つもない場合があるからここは例外処理にしないと
			genre: json.categories[0].shortName,
			address: json.location.formattedAddress.join('-'),
			detail: '詳細情報'	
		};
		if(json.contact.length > 0){ willdo.phone = json.contact.formattedPhone; }

		// foursquareはデータが少ないので、idでさらにその地点を検索して詳細情報を取れるようにする。
		var id = json.id;

		createWillDo(willdo, function($willdo) {
			addWillDo($willdo);
		});
	});

});