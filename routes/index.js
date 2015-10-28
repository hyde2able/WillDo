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
	});
};
