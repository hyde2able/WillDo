var http = require('http');


// 住所(施設、郵便番号)　→　緯度経度
module.exports.AddressToLngLon = function(address, req, res, cb) {
	geocoder.geocode(address, function( err, data ){
		if( err ){
 			req.flash('alert', address + 'は検索できません。');
 			req.url('/');
 			res.redirect(301, '/');
 			return;
 		}
		var formatted_address = data.results[0].formatted_address;
		var geometry = data.results[0].geometry.location;
		var lat = geometry.lat, lng = geometry.lng;
		//console.log(formatted_address);
		//console.log(geometry);
		// Weather(lat, lng);
		// BarNavi(lat, lng);
		// GNavi(lat, lng);
		// Canpas(lat, lng);
		// Gourmet(lat, lng);
		// Place(lat, lng);
		cb(lat, lng);
	});
};

// 緯度経度　→　日本語で住所表示　
module.exports.ReverseGeo = function(lat, lng, cb) {
	var ReverseURI = "http://reverse.search.olp.yahooapis.jp/OpenLocalPlatform/V1/reverseGeoCoder?lat=" + lat + "&lon=" + lng + "&output=json&appid=" + config.Yahoo.appid;
	request(ReverseURI, function(err, res, body){
		if( !err && res.statusCode == 200){
			var address = JSON.parse(body).Feature[0].Property.Address;
			cb(address);
		} else {
			console.log("We couldn't reverseGeoCoder"); return;
		}
	});
};

// 緯度経度　→　その地点の天気情報 by Yahoo (1h)
module.exports.Weather = function(lat, lng, cb) {
	// Yahooは24時間あたり50000リクエストが上限
	var weatherURI = "http://weather.olp.yahooapis.jp/v1/place?coordinates=" + lng + "," + lat + "&output=json&appid=" + config.Yahoo.appid;
	request(weatherURI, function(err, res, body){
		if( !err && res.statusCode == 200){
			var weatherList = JSON.parse(body).Feature[0].Property.WeatherList.Weather;
			// console.log(weatherList); 
		} else {
			console.log("We couldn't get weather info"); return;
		}
	});
};

// 緯度経度　→　付近のバーを検索 by BAR-NAVI
module.exports.BarNavi = function(lat, lng, cb) {
	var barURI = "http://webapi.suntory.co.jp/barnavi/v2/shops?key=" + config.BAR_NAVI.api_key + "&pattern=1&lat=" + lat + "&lng=" + lng;
	barURI += "&format=json&url=http://localhost:3000";
	request(barURI, function(err, res, body){
		if( !err && res.statusCode == 200){
			var shops = JSON.parse(body).shops.shop;
			// console.log(shops);
		} else {
			console.log("We couldn't get bar info"); return;
		}
	});
};

// 緯度経度　→　付近のレストラン　by ぐるなび
module.exports.GNavi = function(lat, lng, cb) {
	var GNaviURI = "http://api.gnavi.co.jp/RestSearchAPI/20150630/?keyid=" + config.G_NAVI.api_key + "&format=json&latitude=" + lat + "&longitude=" + lng;
	request(GNaviURI, function(err, res, body){
		if( !err && res.statusCode == 200){
			var rests = JSON.parse(body).rest;
			// console.log(rests);
		} else {
			console.log("We couldn't get restaurant info"); return;
		}
	});
};

// 緯度経度　→　付近のキャンパス　by りくなび
module.exports.Canpus = function(lat, lng, cb) {
	var CanURI = "http://webservice.recruit.co.jp/shingaku/campus/v2/?key=" + config.RECRUIT.api_key + "&lat=" + lat + "&lng=" + lng + "&format=json";
	request(CanURI, function(err, res, body){
		if( !err && res.statusCode == 200){
			var canpas = JSON.parse(body).results.campus;
			// console.log(canpas);
		} else {
			console.log("We couldn't get canpas info"); return;
		}
	});
};

// 緯度経度　→　付近のグルメ by りくなび
module.exports.Gourmet = function(lat, lng, cb) {
	var GourmetURI = "http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=" + config.RECRUIT.api_key + "&lat=" + lat + "&lng=" + lng + "&format=json";
	request(GourmetURI, function(err, res, body){
		if( !err && res.statusCode == 200){
			var gourmet = JSON.parse(body).results.shop;
			// console.log(gourmet);
		} else {
			console.log("We couldn't get Gourmet info"); return;
		};
	});
};

// 緯度経度　→　付近の施設 by Yahoo
module.exports.Place = function(lat, lng, cb) {
	var PlaceURI = "http://placeinfo.olp.yahooapis.jp/V1/get?output=json&lat=" + lat + "&lon=" + lng + "&appid=" + config.Yahoo.appid;
	request(PlaceURI, function(err, res, body){
		if( !err && res.statusCode == 200){
			var places = JSON.parse(body).ResultSet.Result;
			// console.log(places);
		} else {
			console.log("We couldn't get Place info"); return;
		};
	});

	request({url: PlaceURI})
		.pipe(JSONStream.parse('ResultSet.Result.*'))
		.pipe(es.mapSync( function(data) {
			//console.log(data);
			//console.log('ok');

			// return data;
		}));

};


/*
		使用しているAPI一覧
			- Yahoo 気象情報API http://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/weather.html
			- Yahoo リバースジオコーディングAPI http://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/reversegeocoder.html
			- Yahoo 場所検索API http://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/placeinfo.html
			- npm(geocoder) Google Map APIを使っているらしい
			- BAR NAVI API http://webapi.suntory.co.jp/barnavidocs/api.html
			- ぐるなび  http://api.gnavi.co.jp/api/manual/restsearch/
			- キャンパス検索API リクナビ　http://webservice.recruit.co.jp/shingaku/reference-v2.html#2
			- グルメ検索API リクナビ　http://webservice.recruit.co.jp/hotpepper/reference.html

*/