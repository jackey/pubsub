var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
	secret: 'pubsub',
	resave: false,
	saveUninitialized: false,
	cookie: { secure: true }
}));

// Log
app.use(function (req, res, next) {
	console.log('pub/sub ...');

	next();
});

module.exports = function () {
	return app;
}