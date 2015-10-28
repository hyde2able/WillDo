var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config');
var geocoder = require('geocoder');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.query);
  res.render('index', { title: 'Express' });
});



router.get('/do', function(req, res, next) {
	var address = req.query.address;
 
	AddressToLngLon(address, function(){});

	res.render('do', {title: config.Yahoo.appid});
});


module.exports = router;



// 住所(施設、郵便番号)を緯度経度に変換。
var AddressToLngLon = function(address, callback){

	geocoder.geocode(address, function( err, data ){
		if( err ){ console.log("Not Found adress."); throw err; }
		var formatted_address = data.results[0].formatted_address;
		var geometry = data.results[0].geometry.location;

		console.log(formatted_address);
		console.log(geometry);
		KnowWeather(geometry.lat, geometry.lng);
		KnowBar(geometry.lat, geometry.lng);
	});
};


// 緯度経度からその地点の天気情報を取得 by Yahoo
var KnowWeather = function(lat, lng, callback){
	// Yahooは24時間あたり50000リクエストが上限
	var weatherURI = "http://weather.olp.yahooapis.jp/v1/place?coordinates=" + lng + "," + lat + "&output=json&appid=" + config.Yahoo.appid;
	request(weatherURI, function(err, res, body){
		if( !err && res.statusCode == 200){
			var weatherList = JSON.parse(body).Feature[0].Property.WeatherList.Weather;
			console.log(weatherList); 
		} else {
			console.log("We couldn't get weather info"); throw err;
		}
	});
};

// 緯度経度から近くのバーを検索する by BAR-NAVI
var KnowBar = function(lat, lng, callback){
	var barURI = "http://webapi.suntory.co.jp/barnavi/v2/shops?key=" + config.BAR_NAVI.api_key + "&pattern=1&lat=" + lat + "&lng=" + lng;
	barURI += "&format=json&url=http://localhost:3000";
	// APIアクセス例
	// http://webapi.suntory.co.jp/barnavi/v2/shops?key=f4a90013c9def7a74829062a419b396314a68a01faf2a95b76e22bcb70a1f4a3&pattern=1&lat=35.170915&lng=136.8815369&format=json&url=http://localhost:3000
	request(barURI, function(err, res, body){
		if( !err && res.statusCode == 200){
			var shops = JSON.parse(body).shops.shop;
			console.log(shops);
		} else {
			console.log("We could't get bar info"); throw err;
		}
	});
	console.log(barURI);
};


/*
		使用しているAPI一覧
			- Yahoo 気象情報API http://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/weather.html
			- npm(geocoder) Google Map APIを使っているらしい
			- BAR NAVI API http://webapi.suntory.co.jp/barnavidocs/api.html


*/