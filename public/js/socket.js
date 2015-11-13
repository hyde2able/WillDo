// クライアント側のsocket
$(function(){

	// 渡したオブジェクトや変数などが空かをTorFで判定する
	function empty(obj) {
		if( !obj ) { return true; } // undefined　か　null　か　空文字列　か　０　かどうか
		if( (obj instanceof Object) && !(obj.length > 0) ) { return true; } // objectが配列かハッシュで長さが0以下なら空
		return false;
	};

	// 名前が15文字以上だと1行に収まらないので、画像の大きさに合わせて表示文字列を変更して返す
	function appropriate(str){
		var width = $(window).width, max;
		if(width < 768) { // col-xs なら
			max = 7;
		} else if(width < 991) { // col-sm なら
			max = 9;
		} else if(width < 1199) { // col-md なら
			max = 10;
		} else { // col-ld なら
			max = 12;
		}
		var Ret = str.substr(0, max);
		if(str.length > max) Ret += '...';
		return Ret; 
	};

	// 受け取ったdata(JSON)を元に専用のwilldoを生成するメソッド
	function createWillDo(data, cb) {
		var content = '';

		var $willdo = $("<div></div>", {
			css: { display: 'none' },
			addClass: 'willdo col-md-3 col-sm-6 col-xs-10'
		});

		for(attr in data.basic) {
			if( empty(data.basic[attr]) ){ continue; }	// 中身が空ならスキップ
			switch(attr) {
				case "image":
					content += '<img alt="' + data.basic.name + '" id="thumbnail" class="thumb" src="' + data.basic[attr] + '" />'; 
					content += '<img class="plus" id="plus" src="images/append.png" width="30" height="30" /> ';
					break;
				case "name":
					content += '<a href="' + data.basic.url + '" target="_blank" class="name" >'
					content += '<strong class="name">' + appropriate(data.basic[attr]) + '</strong>'; 
					content += '</a>'; break;
				case "lat": case "lng":
					$willdo.attr(attr, data.basic[attr]); break;
				case "pr_short":
					content += '<p class="pr">' + data.basic[attr] + '</p>'; break;
				default:
					content += '<p class="' + attr + '">' + data.basic[attr] + '</p>'; break;
			}
		}

		content += '<img src="images/more.png" id="more" class="more" width="30" height="30" />';
		content += '<div id="details" class="details" style="display: none;">';

		for(attr in data.details) {
			if( empty(data.details[attr]) ){ continue; }	// 中身が空ならスキップ
			switch(attr) {
				case "address":
					content += '<p class="address"> 住所:' + data.details[attr] + '</p>'; break;
				case "access":
					content += '<p class="access"> アクセス:' + data.details[attr] + '</p>'; break;
				case "pr_long":
					content += '<p class="detail"> ' + data.details[attr] + '</p>'; break;
				case "tel":
					content += '<p class="tel"> 連絡先:' + data.details[attr] + '</p>'; break;
				default:
					break;
			}
		}
		content += '<img src="images/nomore.png" id="nomore" class="nomore" width="30" height="30" />';
		content += '</div>';


		$('<div></div>', {
			addClass: 'inner',
			id: 'inner',
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
			image: json.url_photo_l1 || '',
			name: json.name,
			lat: json.lat_world,
			lng: json.lng_world,
			budget: json.budget,
			genre: json.type,
			open: json.open,

			address: json.address,
			access: json.access,
			url: {pc: json.url_pc, mobile: json.url_mobile}
		}

		createWillDo(willdo, function($willdo) {
			addWillDo($willdo);
		});

	});

	// BarNaviのjsonを受け取る
	socket.on('gnavi', function(json) {
		var willdo = {
			basic: {
				image: json.image_url.shop_image1,
				name: json.name,
				lat: json.latitude,
				lng: json.longitude,
				pr_short: json.pr.pr_short,
				budget: json.budget,
				genre: json.category,
				open: json.opentime
			},
			details: {	
				address: json.address,
				access: json.access.line + json.access.station + json.access.station_exit + json.access.walk,
				pr_long: json.pr.pr_long,
				url: {pc: json.url, mobile: json.url_mobile},
				tel: json.tel
			}
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
			basic: {
				image: json.photo.pc.l,
				name: json.name,
				lat: json.lat,
				lng: json.lng,
				budget: json.budget.average,
				genre: json.genre.name + "(" + json.genre.catch + ")",
				open: json.open
			},
			details: {
				address: json.address,
				access: json.mobile_access,
				url: {pc: json.urls.pc, mobile: ''}
			} 
		};

		createWillDo(willdo, function($willdo) {
			addWillDo($willdo);
		});
	});

	// BarNaviのjsonを受け取る
	socket.on('place', function(json) {
		var willdo = {
			name: json.Name,
			genre: json.category,
			address: json.Where
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
			basic: {
				image: json.main.photo[0].l,
				name: json.name,
				lat: json.lat,
				lng: json.lng,
				pr_short: json.catch_copy,
				open: json.open
			},
			details: {
				address: json.address,
				access: json.access,
				pr_long: json.description || json.note
			}
		};
		createWillDo(willdo, function($willdo) {
			addWillDo($willdo);
		});
	});

	// Relaxのjsonを受け取る
	socket.on('relax', function(json) {
		var willdo = {
			basic: {
				image: json.main.photo[0].l,
				name: json.name,
				lat: json.lat,
				lng: json.lng,
				pr_short: json.catch_copy,
				open: json.open
			},
			details: {
				address: json.address,
				access: json.access,
				pr_long: json.description || json.note
			}
		};
		createWillDo(willdo, function($willdo) {
			addWillDo($willdo);
		});
	});

	// travelのjsonを受け取る
	socket.on('travel', function(json) {
		json = json.hotel[0].hotelBasicInfo;
		var willdo = {
			basic: {
				image: json.hotelThumbnailUrl,
				name: json.hotelName,
				lat: json.latitude,
				lng: json.longitude,
				pr_short: json.hotelSpecial,
				budget: json.hotelMinCharge + "~"
			}, 
			details: {
				address: json.address1 + json.address2,
				access: json.access,
				tel: json.telephoneNo
			}
		};
		createWillDo(willdo, function($willdo) {
			addWillDo($willdo);
		});

	});

});