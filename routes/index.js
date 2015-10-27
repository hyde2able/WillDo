var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.query);
  res.render('index', { title: 'Express' });
});

router.get('/do', function(req, res, next) {
	var geocodeURI = 'http://geo.search.olp.yahooapis.jp/OpenLocalPlatform/V1/geoCoder?';
	var address = req.query.address;
	if( !address ){ console.log("Not Found adress."); res.redirect(302, "/"); }

	geocodeURI += "&appid=" + "dj0zaiZpPWtoTUdJNW9yMGlwcyZzPWNvbnN1bWVyc2VjcmV0Jng9ZmE-";
	geocodeURI += "&output=json";
	geocodeURI += "&query=" + encodeURI(address.toString("utf8"));

	request(geocodeURI, function(err, res, body) {
		if( !err && res.statusCode == 200) {
			var json = JSON.parse(body);
			console.log(json);
		};
	});

	res.render('do', {title: "aa"});
});

module.exports = router;
