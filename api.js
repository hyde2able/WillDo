var geocoder = require('geocoder');
var config = require('config');
var request = require('request');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var flash = require('express-flash');

// 大量のJSONをストリーミングで取得
var JSONStream = require('JSONStream');
var es = require('event-stream');

// クライアントに送信するメソッドServer2Clientを持つオブジェクト
var S2C = require('./bin/www');
var me = require('./api.js');

// 住所(施設、郵便番号)を緯度経度に変換。
module.exports.AddressToLngLon = function(address, req, res, callback){
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
		callback(lat, lng);
	});
};

module.exports.ReverseGeo = function(lat, lng, callback){
	var ReverseURI = "http://reverse.search.olp.yahooapis.jp/OpenLocalPlatform/V1/reverseGeoCoder?lat=" + lat + "&lon=" + lng + "&output=json&appid=" + config.Yahoo.appid;
	request(ReverseURI, function(err, res, body){
		if( !err && res.statusCode == 200){
			var address = JSON.parse(body).Feature[0].Property.Address;
			callback(address);
		} else {
			console.log("We couldn't reverseGeoCoder"); return;
		}
	});


		//me.Weather(lat, lng);
		me.BarNavi(lat, lng);
		//me.GNavi(lat, lng);
		//me.Campus(lat, lng);
		//me.Gourmet(lat, lng);
		//me.Place(lat, lng);
		//me.FourSquare(lat, lng);
};


// 緯度経度からその地点の天気情報を取得 by Yahoo
module.exports.Weather = function(lat, lng, callback){
	// Yahooは24時間あたり50000リクエストが上限
	var weatherURI = "http://weather.olp.yahooapis.jp/v1/place?coordinates=" + lng + "," + lat + "&output=json&appid=" + config.Yahoo.appid;
	request(weatherURI, function(err, res, body){
		if( !err && res.statusCode == 200){
			var weatherList = JSON.parse(body).Feature[0].Property.WeatherList.Weather;
			// console.log(weatherList); 
			S2C.Server2Client('weather', weatherList);
		} else {
			console.log("We couldn't get weather info"); return;
		}
	});
};

// 緯度経度から近くのバーを検索する by BAR-NAVI
module.exports.BarNavi = function(lat, lng, callback){
	var barURI = "http://webapi.suntory.co.jp/barnavi/v2/shops?key=" + config.BAR_NAVI.api_key + "&pattern=1&lat=" + lat + "&lng=" + lng;
	barURI += "&format=json&url=http://localhost:3000";

	request({url: barURI})
		.pipe(JSONStream.parse('shops.shop.*'))
		.pipe(es.mapSync( function(data) {
			S2C.Server2Client('barnavi', data);
		}));

};

// 緯度経度から近くのレストラン検索 by ぐるなび
module.exports.GNavi = function(lat, lng, callback){
	var GNaviURI = "http://api.gnavi.co.jp/RestSearchAPI/20150630/?keyid=" + config.G_NAVI.api_key + "&format=json&latitude=" + lat + "&longitude=" + lng;

	request({url: GNaviURI})
		.pipe(JSONStream.parse('rest.*'))
		.pipe(es.mapSync( function(data) {
			S2C.Server2Client('gnavi', data);
		}));

};

// 緯度経度から近くのキャンパスを検索 by りくなび
module.exports.Campus = function(lat, lng, callback){
	var CamURI = "http://webservice.recruit.co.jp/shingaku/campus/v2/?key=" + config.RECRUIT.api_key + "&lat=" + lat + "&lng=" + lng + "&format=json";

	request({url: CamURI})
		.pipe(JSONStream.parse('results.campus.*'))
		.pipe(es.mapSync( function(data) {
			//console.log(data);
			S2C.Server2Client('campus', data);
		}));
};

// 緯度経度から近くのグルメを検索 by リクナビ
module.exports.Gourmet = function(lat, lng, callback){
	var GourmetURI = "http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=" + config.RECRUIT.api_key + "&lat=" + lat + "&lng=" + lng + "&format=json";

	request({url: GourmetURI})
		.pipe(JSONStream.parse('results.shop.*'))
		.pipe(es.mapSync( function(data) {
			//console.log(data);
			S2C.Server2Client('gourmet', data);
		}));
};

// 緯度経度から近くの場所を検索 by Yahoo
module.exports.Place = function(lat, lng, callback){
	var PlaceURI = "http://placeinfo.olp.yahooapis.jp/V1/get?output=json&lat=" + lat + "&lon=" + lng + "&appid=" + config.Yahoo.appid;

	request({url: PlaceURI})
		.pipe(JSONStream.parse('ResultSet.Result.*'))
		.pipe(es.mapSync( function(data) {
			//console.log(data);
			S2C.Server2Client('place', data);
		}));
};

// 緯度経度からいろいろな施設？を検索する by FourSquare
module.exports.FourSquare = function(lat, lng, callback) {
  	var FourURI = "https://api.foursquare.com/v2/venues/search?client_id=" + config.FourSquare.client_id + "&client_secret=" + config.FourSquare.client_key;
  	FourURI += "&v=20130815&ll=" + lat + "," + lng + "&limit=50&locale=ja&m=swarm&radius=2000&intent=checkin";

  	request({url: FourURI})
		.pipe(JSONStream.parse('response.venues.*'))
		.pipe(es.mapSync( function(data) {
			//console.log(data);
			console.log(data);
			S2C.Server2Client('foursquare', data);
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
			- FourSquare https://developer.foursquare.com/docs/explore#req=venues/search%3Fll%3D40.7,-74
*/

