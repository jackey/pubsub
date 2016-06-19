var net = require('net');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function _SocketClient(port, address) {
	this.port = port;
	this.address = address;
	this.channels = {};
}

util.inherits(_SocketClient, EventEmitter);

_SocketClient.prototype.connect = function (cb) {
	this.socket = net.connect(this.port, this.address);
	var self = this;
	['close', 'data', 'drain', 'end', 'error'].map(function (event) {
		if (typeof self['on'+ event] == 'function') {
			self.socket.on(event, self['on'+event].bind(self));
		}
	});

	this.socket.on('connect', function () {
		cb.bind(self)(this.socket);
	});
}

_SocketClient.prototype.ondata = function (data) {
	data = JSON.parse(data);
	var channel_name = data['channel'];
	var event = data['event'];
	var data = data['data'];
	var channel = this.channel(channel_name);
	channel.emit('channel:'+channel_name+':event:'+event, data);
}

_SocketClient.prototype.channel = function (channel_name, options) {
	this.channels[channel_name] || ( this.channels[channel_name] = new _Channel(this.socket, channel_name, options) );
	return this.channels[channel_name];
}

function _Channel(socket, channel_name, options) {
	this.name = channel_name;
	this.socket = socket;
}

util.inherits(_Channel, EventEmitter);

_Channel.prototype.pub = function (event, data, cb) {
	var data = {
		channel: this.name,
		event: event,
		data: data
	}
	this.once('channel:'+this.name+':event:'+event, cb);
	this.socket.write(JSON.stringify(data));
}


module.exports = function (port, address) {
	if (!port) throw "server port is required";
	address || (address = '127.0.0.1');

	return new _SocketClient(port, address);
}