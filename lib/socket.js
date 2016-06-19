var net = require('net');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function _Socket(client, port, address) {
	this.client = client;
	this.port = port || 3032;
	this.address = address || '127.0.0.1';
	this.server = net.createServer();
	this.backlog = 1023;
	this.socket_id = 1;
	this.dataBufferSize = 1024 * 1024;
}

util.inherits(_Socket, EventEmitter);

_Socket.prototype.onConnection = function (socket) {
	var self = this;
	this.socket_id += 1;
	socket.id = this.socket_id;
	this.emit('connection', socket);

	socket.on('data', function (data) {
		try {
			data = JSON.parse(data.toString('utf-8'));
			var channelName = data['channel'];
			var event = data['event'];
			var clientData = data['data'];
			self.channel(socket, channelName).pub(event, clientData);
		}
		catch (e) {
			console.log('Sorry, can\'t parse data to json format ! ');
		} 
	});
 

	socket.on('close', function () {
		// TODO::
	});
}

_Socket.prototype.connect = function (cb) {
	var self = this;
	this.on('connection', function (socket) {
		cb.bind(self)(socket);
	});
}

_Socket.prototype.onError = function (err) {
	// TODO::
}

_Socket.prototype.onClose = function () {
	// TODO::
}

_Socket.prototype.start = function (cb) {
	cb || (cb = {});

	this.server.listen(this.port, this.address, this.backlog, cb);
	this.server.on('error', this.onError.bind(this));
	this.server.on('connection', this.onConnection.bind(this));
	this.server.on('close', this.onClose.bind(this));

	return this;
}

_Socket.prototype.channel = function (socket, name, options) {
	var channel = this.client.Channel(socket.id+ ':'+ name);

	function tell(event, data) {
		var tellBackData = {
			channel: name,
			event: event,
			data
		};
		socket.write(JSON.stringify(tellBackData));
	}

	channel.tell = tell;

	return channel;
}

module.exports = function (client, port, address) {
	return new _Socket(client, port, address);
}