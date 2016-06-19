var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var bluebird = require('bluebird');

var app = express();
// cookie
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// session
app.use(session({
	name: 'sid',
	secret: 'pubsub',
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 60000,
		secure: false,
		httpOnly: false
	}
}));

// Log
app.use(function (req, res, next) {
	//TODO:: log pub/sub
	next();
});

// pub from http params.
app.post('/channel/:channel_name/pub/:event', function (req, res, next) {
	var channel_name = req.params.channel_name;
	var event = req.params.event;
	var data = req.body;

	var channel = app.pubsub.Channel(channel_name);
	channel.pub(event, data);

	res.status(200).json({
		success: true
	});

	next();
});

// request sub result from http params.
app.get('/channel/:channel_name/sub/:event', function (req, res, next) {
	var channel_name = req.params.channel_name;
	var event = req.params.event;
	app._HttpREST.getResponse(channel_name, event).then(function (doc) {
		res.status(200).json(doc);
	});
});

function _HttpREST(client) {
	this.client = client;

	// inhirect functions from app to _HttpREST
	for (var key in app) {
		if (typeof app[key] == 'function') {
			this[key] = app[key].bind(app);
		}
	}
	app.pubsub = client;
	app._HttpREST = this;

	this.channels = {};
}

_HttpREST.prototype.channel = function (name, options) {
	return this.client.Channel(name, options);
}

// TODO:: 
// difference user maybe override  response data. 
// we have to use same way like unique id to mark the response data for each other.
_HttpREST.prototype.response = function (channel_name, event, data) {
	this.client.redis.hsetAsync(channel_name, event, JSON.stringify(data))
		.then(function () {
			//
		}).finally(function () {
			//
		});
}

_HttpREST.prototype.getResponse = function (channel_name, event) {
	var self = this;
	return new bluebird.Promise(function (resolve, reject) {
		self.client.redis.hgetAsync(channel_name, event)
			.then( function (data) {
				data = JSON.parse(data);
				resolve(data);
			});
	});
}

module.exports = function (client) {
	return new _HttpREST(client);
}























