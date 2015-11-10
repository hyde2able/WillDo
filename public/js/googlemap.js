$(function() {

	/* 検索した現在位置 */
	var StartLatLng = new google.maps.LatLng( parseFloat( $('#IamHere').attr('lat') ), parseFloat( $('#IamHere').attr('lng') ) );

	var map
	,	directionsRenderer
	,	directions
	,	err = google.maps.DirectionsStatus
	,	directionsErr = new Array();
	directionsErr[err.INVALID_REQUEST] = "指定された DirectionsRequest が無効です。";
	directionsErr[err.MAX_WAYPOINTS_EXCEEDED] = "DirectionsRequest に指定された DirectionsWaypoint が多すぎます。ウェイポイントの最大許容数は 8 に出発地点と到着地点を加えた数です。";
	directionsErr[err.NOT_FOUND] = "出発地点、到着地点、ウェイポイントのうち、少なくとも 1 つがジオコード化できませんでした。";
	directionsErr[err.OVER_QUERY_LIMIT] = "ウェブページは、短期間にリクエストの制限回数を超えました。";
	directionsErr[err.REQUEST_DENIED] = "ウェブページではルート サービスを使用できません。";
	directionsErr[err.UNKNOWN_ERROR] = "サーバー エラーのため、ルート リクエストを処理できませんでした。もう一度試すと正常に処理される可能性があります。";
	directionsErr[err.ZERO_RESULTS] = "出発地点と到着地点間でルートを見つけられませんでした。";

	initialize();

	/* 地図の初期化  */
	function  initialize() {
		var myOptions = {
			zoom: 17,
			center: StartLatLng,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map( document.getElementById("map"), myOptions);		// Google Maps作成

		// ルートレンダラー生成
		directionsRenderer = new google.maps.DirectionsRenderer( {
			polylineOptions: {
				strokeColor: "#FF0000",
				strokeWeight: 4,
				strokeOpacity: 0.7
			}
		});
		directionsRenderer.setMap(map);			// ルートレンダラーをマップに関連付け		
	};


	/* ルート検索 */
	function searchRoute(lat, lng) {
		var EndLatLng = new google.maps.LatLng( parseFloat(lat), parseFloat(lng) );

		// 検索設定 ルート生成
		directions = new google.maps.DirectionsService();
		// ルートリクエスト
		directions.route( {
			origin: StartLatLng,		// 開始位置
			destination: EndLatLng, 	// 終了位置　
			travelMode: google.maps.DirectionsTravelMode.WALKING,	// ルートタイプ(徒歩)　車ならDRIVING
			unitSystem: google.maps.DirectionsUnitSystem.METRIC,
			optimizeWaypoints: true,	// 最適化された最短距離にする
			avoidHighways: true,		// 高速道路は使わない
			avoidTolls: true			// 有料道路は使わない
		},
		function(results, status){
			if( status == err.OK ) {	// 検索結果がtrueの場合
				directionsRenderer.setDirections(results);
			} else {
				var message = directionsErr[status];
				$('#messages').append('<div class="alert alert-warning alert-dismisable" role="alert" id="alert"><button type="button" class="close" data-dismiss="alert" aria-label="閉じる"><span aria-hidden="true">×</span></button><p><strong>warning</strong>：' + message + '</p></div>');
			}
		});
	};

	/* willdoをクリックしたらそのlatとlngを取得してルート検索 */
	$(document).on("click", "#willdo", (function() {
		var lat = $(this).attr('lat')
		,	lng = $(this).attr('lng');

		searchRoute(lat, lng);
	}));

});