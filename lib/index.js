var util = require('util');
var EventEmitter = require('events').EventEmitter;
var pubsubHttp = require('./http');
var pubsubSocket = require('./socket');
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

    this.redis.on('ready', this.ready.bind(this));

    this.channles = {};
}

util.inherits(_Client, EventEmitter);

// client ready.
_Client.prototype.ready = function () {
    this.emit('ready');
}

_Client.prototype.Channel = function (name, options) {
    if (typeof this.channles[name] == 'undefined' || this.channles[name].closed) {
        this.channles[name] = new Channel(name, this.redis, options);
    }

    return this.channles[name];
}

_Client.prototype.http = function () {
    return pubsubHttp(this);
}

_Client.prototype.socket = function (port, address) {
    return pubsubSocket(this, port, address);
}

exports.Client = function (options) {
    options = Object.assign({
        redis: 'redis://localhost:6379'
    }, options);

    return new _Client();
}