var express = require('express');
var router = express.Router();

// APIを叩くメソッド一覧
var api = require('../api.js');
var S2C = require('../bin/www');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   console.log(req.flash());
//   console.log(req.flash('alert'));
//   // res.render('index', {messages: ['1', '2','3']});
//   res.render('index', {messages: req.flash('alert')} );
// });


router.post('/', function(req, res, next) {
	// var address = req.query.address;
	var address = req.body.address;

	// setTimeout(function() {
	// 	S2C.Server2Client('sample', 'ksoamzoaksoamsoa');

	// }, 3000);

	if( !address || address == "" ) {
		res.render('index', {messages: ['住所や郵便番号を入力してください'] , title: '' } );
		return;
	}

	api.AddressToLngLon(address, req, res, function(lat, lng) {
		api.ReverseGeo(lat, lng, function(japan_address) {
			res.render('search', {messages: [], title: japan_address});
		});
	});


});



router.get('/search', function(req, res, next) {
	var address = req.query.address;
	console.log(address);
	if( !address || address == "") {
		req.flash('alert', '住所や郵便番号を入力してください。');
		console.log(req.flash('alert'));
 		res.redirect(301, '/');
 		return;
 	}

	AddressToLngLon(address, req, res, function(lat, lng){
		ReverseGeo(lat, lng, function(add){
			res.render('search', {title: add});
		});
	});

});


module.exports = router;

