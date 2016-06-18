var util = require('util');
var EventEmitter = require('events').EventEmitter;
var pubsubHttp = require('./http');
var bluebird = require('bluebird');
var redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var Channel = exports.Channel = require('./channel');

function _Client(redisURI) {
	this.redisURI = redisURI;
	this.redis = redis.createClient({
		url: this.redisURI
	});

	this.channles = {};
}

util.inherits(_Client, EventEmitter);

_Client.prototype.Channel = function (name, options) {
	if (typeof this.channles[name] == 'undefined' || this.channles[name].closed) {
		this.channles[name] = new Channel(name, this.redis, options);
	}

	return this.channles[name];
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