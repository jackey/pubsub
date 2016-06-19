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
	this.redis.on('error', this.redisError.bind(this));

	this.listen();
}

util.inherits(_Channel, EventEmitter);

_Channel.prototype.sub = function (event, cb) {
	var self = this;

	// on('message')
	if (typeof event == 'function') {
		cb = event;
		event = 'message';
	}

	this.on(event, cb);

	return {
		unsub: function () {
			self.removeListener(event, cb);
		}
	}
}

_Channel.prototype.redisError = function (err) {
	this.log('redis err: ' + err);
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

	this.emit('close');

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
		if (doc) {
			if (typeof doc['event'] != 'undefined') {
				self.emit(doc['event'], doc['data']);
				self.emit('message', doc['data']); // message
			}
			self.emit('document', doc);
		}
	}).catch( function (e) {
		self.log(e);
	}).finally(function () {
		self.closed || process.nextTick(self.listen.bind(self));
	});

	return this;
}

module.exports = _Channel;