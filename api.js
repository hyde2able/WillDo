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


// 指定したURLのapiを叩いて、帰って来たJSONのformatに合わせてストリーミングで取得したdataをdataNameという名前でエミットする。
var emitJSON = function(url, format, dataName) {
	request({url: url})
		.pipe(JSONStream.parse(format))
		.pipe(es.mapSync( function(data) {
			//console.log(data);
			S2C.Server2Client(dataName, data);
		}));
};


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

		//Weather(lat, lng);
		//BarNavi(lat, lng);
		//GNavi(lat, lng);
		//Campus(lat, lng);
		//Gourmet(lat, lng);
		//Place(lat, lng);
		//FourSquare(lat, lng);
		Salon(lat, lng);
		//Relax(lat, lng);
		//Travel(lat, lng);
		//Hotel(lat, lng);
};


// 緯度経度からその地点の天気情報を取得 by Yahoo
var Weather = function(lat, lng){
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
var BarNavi = function(lat, lng){
	var barURI = "http://webapi.suntory.co.jp/barnavi/v2/shops?key=" + config.BAR_NAVI.api_key + "&pattern=1&lat=" + lat + "&lng=" + lng;
	barURI += "&format=json&url=http://localhost:3000";

	emitJSON(barURI, 'shops.shop.*', 'barnavi');
};

// 緯度経度から近くのレストラン検索 by ぐるなび
var GNavi = function(lat, lng){
	var GNaviURI = "http://api.gnavi.co.jp/RestSearchAPI/20150630/?keyid=" + config.G_NAVI.api_key + "&format=json&latitude=" + lat + "&longitude=" + lng;

	emitJSON(GNaviURI, 'rest.*', 'gnavi');
};

// 緯度経度から近くのキャンパスを検索 by りくなび
var Campus = function(lat, lng){
	var CamURI = "http://webservice.recruit.co.jp/shingaku/campus/v2/?key=" + config.RECRUIT.api_key + "&lat=" + lat + "&lng=" + lng + "&format=json";

	emitJSON(CamURI, 'results.campus.*', 'campus');
};

// 緯度経度から近くのグルメを検索 by リクナビ
var Gourmet = function(lat, lng){
	var GourmetURI = "http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=" + config.RECRUIT.api_key + "&lat=" + lat + "&lng=" + lng + "&format=json";

	emitJSON(GourmetURI, 'results.shops.*', 'gourmet');
};

// 緯度経度から近くの場所を検索 by Yahoo
var Place = function(lat, lng){
	var PlaceURI = "http://placeinfo.olp.yahooapis.jp/V1/get?output=json&lat=" + lat + "&lon=" + lng + "&appid=" + config.Yahoo.appid;

	emitJSON(PlaceURI, 'ResultSet,Result.*', 'place');
};

// 緯度経度からいろいろな施設？を検索する by FourSquare
var FourSquare = function(lat, lng) {
  	var FourURI = "https://api.foursquare.com/v2/venues/search?client_id=" + config.FourSquare.client_id + "&client_secret=" + config.FourSquare.client_key;
  	FourURI += "&v=20130815&ll=" + lat + "," + lng + "&limit=50&locale=ja&m=swarm&radius=2000&intent=checkin";

  	emitJSON(FourURI, 'response.venues.*', foursquare);
};

// 緯度経度からサロンを検索 by りくなび
var Salon = function(lat, lng) {
	var SalonURI = "http://webservice.recruit.co.jp/beauty/salon/v1/?key=" + config.RECRUIT.api_key + "&lat=" + lat + "&lng=" + lng ;
	SalonURI += "&format=json&range=4&count=10";

	emitJSON(SalonURI, 'results.salon.*', 'salon');
};

// 緯度経度からリレクッス＆ビューティーサロンを検索 by りくなび
var Relax = function(lat, lng) {
	var RelaxURI = "http://webservice.recruit.co.jp/relax/salon/v1/?key=" + config.RECRUIT.api_key + "&lat=" + lat + "&lng=" + lng;
	RelaxURI += "&format=json&range=4&count=10";

	emitJSON(RelaxURI, 'results.salon.*', 'relax');
};

// 緯度経度からトラベル施設を検索 by らくてん
var Travel = function(lat, lng) {
	var TravelURI = "https://app.rakuten.co.jp/services/api/Travel/SimpleHotelSearch/20131024?applicationId=" + config.Rakuten.appid + "&format=json";
	TravelURI += "&latitude=" + lat + "&longitude=" + lng + "&searchRadius=2&datumType=1";

	emitJSON(TravelURI, 'hotels.*', 'travel');
};

// 県のエリアコードから温泉を検索する by じゃらん
var Onsen = function(area) {
	var OunsenURI = "http://jws.jalan.net/APICommon/OnsenSearch/V1/?key=" + config.Jalan.api_key + "&count=20&l_area=" + area;
	console.log(OnsenURI);
	// area はgeocoderで取得した県の名前からサーチする。

};

// 緯度経度から宿泊地を検索 by じゃらん
var Hotel = function(lat, lng) {
	var HotelURI = "http://jws.jalan.net/APIAdvance/HotelSearch/V1/?key=" + config.Jalan.api_key + "&x=" + lat + "&y=" + lng + "&range=10&count=10"
	console.log(HotelURI);
	// 緯度経度がうまく設定できていないみたい
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
			- サロン検索　りくなび　http://webservice.recruit.co.jp/beauty/reference.html#a1to
			- リラクゼーション検索　りくなび　http://webservice.recruit.co.jp/relax/salon/v1/
			- トラベル施設検索　楽天　https://webservice.rakuten.co.jp/api/simplehotelsearch/
			- 温泉検索　じゃらん　http://www.jalan.net/jw/jwp0100/jww0104.do
			- 宿泊地検索　じゃらん	http://www.jalan.net/jw/jwp0100/jww0102.do

*/

