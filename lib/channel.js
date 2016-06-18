var EventEmitter = require('events').EventEmitter;
var util = require('util');

function _Channel(name, redisClient, options) {
	options = Object.assign(options || {}, {
		size: (1024 * 1024 * 1 ), // the Data max size is 1mb
	});
	this.name = name;
	this.redis = redisClient;
	this.namespace = 'nodejs_subpub';
	this.closed = false;

	this.listen();
}

util.inherits(_Channel, EventEmitter);

_Channel.prototype.sub = function (event, cb) {
	var self = this;

	this.on(event, cb);

	return {
		unsub: function () {
			self.removeListener(event, cb);
		}
	}
}

// very simple log function
_Channel.prototype.log = function (log, level) {
	level || (level = 'error');
	if (typeof console[level] == 'undefined') {
		console[level] = console.log
	}

	console[level](level+':' + log);
}

_Channel.prototype.key = function () {
	return this.namespace + ':' + this.name;
}

_Channel.prototype.close = function () {
	this.closed = true;

	return this;
}

/**
 * Save the event data to list 
 */
_Channel.prototype.pub = function (event, data, cb) {
	cb || (cb = function () {});

	this.redis.lpushAsync(this.key(), JSON.stringify({event: event, data: data})).then(function (err, doc) {
		cb(err, doc);
	});

	return this;
}

_Channel.prototype.listen = function () {
	var self = this;
	this.redis.rpopAsync(this.key()).then( function (doc) {
		doc = JSON.parse(doc);
		self.emit(doc['event'], doc['data']);
	}).catch( function (e) {
		self.log(e);

	}).finally(function () {
		// after 1s recall listen()
		//self.closed || setTimeout(self.listen.bind(self), 1000);
	});

	return this;
}

module.exports = _Channel;