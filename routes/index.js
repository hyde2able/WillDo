var express = require('express');
var router = express.Router();

// APIを叩くメソッド一覧
var api = require('../api.js');


/* GET home page. */
// router.get('/', function(req, res, next) {
//   console.log(req.flash());
//   console.log(req.flash('alert'));
//   // res.render('index', {messages: ['1', '2','3']});
//   res.render('index', {messages: req.flash('alert')} );
// });


router.get('/', function(req, res, next) {
	var address = req.query.address;
	if( !address || address == "" ) {
		res.render('index', {messages: ['住所や郵便番号を入力してください'] , title: '' } );
		return;
	}

	api.AddressToLngLon(address, req, res, function(lat, lng) {
		api.ReverseGeo(lat, lng, function(add) {
			res.render('search', {messages: [], title: add});
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

