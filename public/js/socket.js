// クライアント側のsocket
$(function(){

	// 渡したオブジェクトや変数などが空かをTorFで判定する
	function empty(obj) {
		if( !obj ) { return true; } // undefined　か　null　か　空文字列　か　０　かどうか
		if( (obj instanceof Object) && !(obj.length > 0) ) { return true; } // objectが配列かハッシュで長さが0以下なら空
		return false;
	};

	// 受け取ったJSONを元に専用のwilldoを生成するメソッド
	function createWillDo(hash, cb) {
		var content = '<div class="caption">';

		var $willdo = $("<div></div>", {
			css: { display: 'none' },
			id: 'willdo',
			addClass: 'willdo col-md-4 col-sm-6 col-xs-10'
		});

		for(type in hash) {
			if( empty(hash[type]) ){ continue; } //中身が空ならスキップ
			switch(type){
				case "image":
					content += '<img alt="' + hash.name + '" class="img-thumbnail text-center" src="' + hash[type] + '" />'; break;
				case "lat": case "lng":
					$willdo.attr(type, hash[type]); break;
				case "name":
					content += '<h2>' + hash[type] + '</h2>'; break;
				case "url":
					content += '<a href="' + hash[type] + '" target="_blank" >URLだよん</a>'; break;
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
			url_pc: json.url_pc,
			url_mobile: json.url_mobile,
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
			name: json.name,
			lat: json.latitude,
			lng: json.longitude,
			url_pc: json.url,
			url_mobile: json.url_mobile,
			address: json.address,
			tel: json.tel,
			genre: json.category,
			open: json.opentime,
			pr_short: json.pr.pr_short,
			pr_long: json.pr.pr_long,
			budget: json.budget,
			image: json.image_url.shop_image1,
			access: json.access.line + json.access.station + json.access.station_exit + json.access.walk
		};
		createWillDo(willdo, function($willdo) {
			addWillDo($willdo);
		});
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

	// Salonのjsonを受け取る
	socket.on('salon', function(json) {
		var willdo = {
			name: json.name,
			image: json.main.photo[0].l,
			lat: json.lat,
			lng: json.lng,
			open: json.open,
			address: json.address,
			pr_short: json.catch_copy,
			pr_long: json.description || json.note,
			access: json.access
		};
		createWillDo(willdo, function($willdo) {
			addWillDo($willdo);
		});
	});

	// Relaxのjsonを受け取る
	socket.on('relax', function(json) {
		var willdo = {
			name: json.name,
			image: json.main.photo[0].l,
			lat: json.lat,
			lng: json.lng,
			open: json.open,
			address: json.address,
			pr_short: json.catch_copy,
			pr_long: json.description || json.note,
			access: json.access
		};
		createWillDo(willdo, function($willdo) {
			addWillDo($willdo);
		});
	});

	// travelのjsonを受け取る
	socket.on('travel', function(json) {
		json = json.hotel[0].hotelBasicInfo;
		var willdo = {
			name: json.hotelName,
			image: json.hotelThumbnailUrl,
			pr_short: json.hotelSpecial,
			budget: json.hotelMinCharge + "~",
			lat: json.latitude,
			lng: json.longitude,
			tel: json.telephoneNo,
			address: json.address1 + json.address2,
			access: json.access
		};
		createWillDo(willdo, function($willdo) {
			addWillDo($willdo);
		});

	});

});