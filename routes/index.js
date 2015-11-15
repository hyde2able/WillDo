var express = require('express');
var router = express.Router();

// APIを叩くメソッド一覧
var api = require('../api.js');

router.get('/', function(req, res, next) {
	res.render('index', {messages: [] } );
	return;
});

process.on('uncaughtException', function(err) {
    console.log(err);
    router.get('/', function(req, res, next) {
		res.render('index', {messages: ['住所が不適切です'] } );
	return;
});
});

router.post('/', function(req, res, next) {
	// var address = req.query.address;
	var address = req.body.address;
	if( !address || address == "" ) {
		res.render('index', {messages: ['住所や郵便番号を入力してください'] } );
		return;
	}
	api.AddressToLngLon(address, req, res, function(lat, lng) {
		api.ReverseGeo(lat, lng, function(japan_address) {
			res.render('search', {messages: [], title: japan_address, lat: lat, lng: lng});
		});
	});

});


module.exports = router;

