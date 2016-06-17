var util = require('util');
var EventEmitter = require('events').EventEmitter;
var pubsubHttp = require('./http');

exports.Channel = require('./channel');

function _Client(redisConfig) {
	this.redisConfig = redisConfig;
	this.redisClient = null;
}

util.inherits(_Client, EventEmitter);

_Client.prototype.Channel = function (name) {
	return new exports.Channel();
}

_Client.prototype.http = function (cb) {
	cb || (cb = function () {});

	return pubsubHttp();
}


exports.Client = function (options) {
	options = Object.assign({
		redis: 'redis://localhost:6379'
	}, options);

	return new _Client();
}