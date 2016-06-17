var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Log
app.use(function (req, res, next) {
	console.log('pub/sub ...');

	next();
});

module.exports = function () {
	return app;
}