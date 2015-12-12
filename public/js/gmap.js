$(function() {

	/* 検索した現在位置 */
	var StartLatLng = new google.maps.LatLng( parseFloat( $('#IamHere').attr('lat') ), parseFloat( $('#IamHere').attr('lng') ) );
	var directionsDisplay
	,	directionsService = new google.maps.DirectionsService()
	,	map
	,	err = google.maps.DirectionsStatus
	,	directionsErr = new Array();

	directionsErr[err.INVALID_REQUEST] = "指定された DirectionsRequest が無効です。";
	directionsErr[err.MAX_WAYPOINTS_EXCEEDED] = "DirectionsRequest に指定された DirectionsWaypoint が多すぎます。ウェイポイントの最大許容数は 8 に出発地点と到着地点を加えた数です。";
	directionsErr[err.NOT_FOUND] = "出発地点、到着地点、ウェイポイントのうち、少なくとも 1 つがジオコード化できませんでした。";
	directionsErr[err.OVER_QUERY_LIMIT] = "ウェブページは、短期間にリクエストの制限回数を超えました。";
	directionsErr[err.REQUEST_DENIED] = "ウェブページではルート サービスを使用できません。";
	directionsErr[err.UNKNOWN_ERROR] = "サーバー エラーのため、ルート リクエストを処理できませんでした。もう一度試すと正常に処理される可能性があります。";
	directionsErr[err.ZERO_RESULTS] = "出発地点と到着地点間でルートを見つけられませんでした。";

	//initialize();

	google.maps.event.addDomListener(window, 'load', initialize() );
	/* 地図の初期化  */
	function  initialize() {
		var myOptions = {
			zoom: 15,
			center: StartLatLng,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scaleControl: true
		};
		map = new google.maps.Map( document.getElementById("gmap"), myOptions);		// Google Maps作成	
		render();	
	};

	/* ルート検索結果を描画 */
	function render() {
		directionsDisplay = new google.maps.DirectionsRenderer({
			"map": map,
			"preserveViewport": true,
			"draggable": true
		});
		directionsDisplay.suppressMarkers = true; 
		// var originMarker = CreateMarker( StartLatLng ); 
		/* 右カラムにルート表示 */
		// directionsDisplay.setPanel( document.getElementById('directions_panel') );


	};
    
    /* マーカーを作成 */
    function CreateMarker(LatLng) {
    	var marker = new google.maps.Marker( {
    		position: LatLng,
    		map: map,
    		draggable: true
    	});
    	// google.maps.event.addListener(marker, "dragend", UpdateRoute); 
    	return marker;
    };

	/* ルート検索 */
	function searchRoute(lat, lng) {
		var EndLatLng = new google.maps.LatLng( parseFloat(lat), parseFloat(lng) );

		var request = {
			origin: StartLatLng,		// 開始位置
			destination: EndLatLng, 	// 終了位置　
			travelMode: google.maps.DirectionsTravelMode.WALKING,	// ルートタイプ(徒歩)　車ならDRIVING
			unitSystem: google.maps.DirectionsUnitSystem.METRIC,
			optimizeWaypoints: true,	// 最適化された最短距離にする
			avoidHighways: true,		// 高速道路は使わない
			avoidTolls: true			// 有料道路は使わない
		};
		// var distinationMarker = CreateMarker( EndLatLng ); 

		// ルート描画
		directionsService.route(request, function(response, status) {
			if( status == google.maps.DirectionsStatus.OK ) {
				directionsDisplay.setDirections(response);
			} else {
				var message = directionsErr[status];
				$('#messages').append('<div class="alert alert-warning alert-dismisable" role="alert" id="alert"><button type="button" class="close" data-dismiss="alert" aria-label="閉じる"><span aria-hidden="true">×</span></button><p><strong>warning</strong>：' + message + '</p></div>');
			}
		});
	};

	// 行き先リスト
	var List = {};
	var count = 0;

	/* willdoをクリックしたらそのlatとlngを取得してルート検索 */
	$(document).on("click", "#willdo", (function() {
		var lat = $(this).attr('lat')
		,	lng = $(this).attr('lng');
		searchRoute(lat, lng);
	}));

	  /* willdoの+アイコンをクリックしたら行きたいリストに追加 */
  $(document).on('click', '#plus', (function() {
    var parent = $(this).parent();
    var name = parent.attr('name')
    ,	lat = parent.attr('lat')
    ,	lng = parent.attr('lng');

    if(name in List){ return; }
    if(count > 7) { return; }
    List[name] = [lat, lng];
    count++;

    console.log( name );

    var $togo = $("<li></li>", {
			html: '|- ' + name + '<img src="images/remove.png" id="remove" class="remove" width="20" height="20">'
		});

    $togo.attr('name', name);
    $togo.attr('lat', lat);
    $togo.attr('lng', lng);

    $togo.appendTo($('#ToGo'));
  }));

  /* 行き先リストの右のマイナスボタンをクリックしたら行き先削除 */
  $(document).on('click', '#remove', (function() {
  	var $togo = $(this).closest('li');
  	var name = $togo.attr('name');

  	$togo.hide(300);
  	delete List[name];
  	count--;
  }));



  /* ルート検索を押したら行き先リストの行き方をプロット */
  $('#ToGoSearch').click(function() {
  	var ToGoList = [],	latlng;
  	for(name in List) {
  		latlng = new google.maps.LatLng( parseFloat(List[name][0]), parseFloat(List[name][1]) );
    	ToGoList.push({ location:latlng, stopover: true });
  	}

  	var EndLatLng = ToGoList.pop().location;
  	console.log(ToGoList);

  	initialize();

	var request={
    	waypoints: ToGoList,		/* 経由地点 */
    	optimizeWaypoints: true,
    	origin: StartLatLng,        /* 出発地点 */
    	destination: EndLatLng,        /* 到着地点 */
    	travelMode: google.maps.DirectionsTravelMode.WALKING,                /* 交通手段 */
    	avoidHighways: true,		// 高速道路は使わない
		avoidTolls: true			// 有料道路は使わない
    };

    // ルート描画
	directionsService.route(request, function(response, status) {
		if( status == google.maps.DirectionsStatus.OK ) {
			directionsDisplay.setDirections(response);
		} else {
			var message = directionsErr[status];
			$('#messages').append('<div class="alert alert-warning alert-dismisable" role="alert" id="alert"><button type="button" class="close" data-dismiss="alert" aria-label="閉じる"><span aria-hidden="true">×</span></button><p><strong>warning</strong>：' + message + '</p></div>');
		}
	});

  });







});