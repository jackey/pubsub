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
    // {channel_name: {event: [socket, socket]}}
    this.channelSockets = {};
}

util.inherits(_Socket, EventEmitter);

_Socket.prototype.socketSub = function (socket, channelName, event) {
    // Save socket int object
    if (typeof this.channelSockets[channelName] == 'undefined' ) this.channelSockets[channelName] = {};
    if (typeof this.channelSockets[channelName][event] == 'undefined') this.channelSockets[channelName][event] = {};
    this.channelSockets[channelName][event][socket.id] = socket;
    var self = this;
    this.channel(channelName).sub(event, function (data) {
        for(var key in self.channelSockets[channelName][event]) {
            var clientSocket = self.channelSockets[channelName][event][key];
            self.tell(clientSocket, channelName, event, data, 'sub');
        }
    });
}

_Socket.prototype.socketPub = function (socket, channelName, event,  data) {
    var self = this;
    this.channel(channelName).pub(event, data, function () {
        self.tell(socket, channelName, event, {status: 'success'}, 'pub');
    });
}

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
            var action = data['action'];
            if (!action || ['pub', 'sub'].indexOf(action) == -1 ) return false;

            if (action == 'pub') {
                self.socketPub(socket, channelName, event, clientData);
            }
            else if (action == 'sub') {
                self.socketSub(socket, channelName, event);
            }
        }
        catch (e) {
            console.log('Sorry, can\'t parse data to json format ! ');
        }
    });
 

    socket.on('close', function () {
        // 从 this.channelSockets删除此socket
        for (var cname in self.channelSockets) {
            for (var event in self.channelSockets[cname]) {
                var sockets = {};
                for (var key in self.channelSockets[cname][event]) {
                    if (socket.id != key) {
                        sockets[key] = self.channelSockets[cname][event][key];
                    }
                }
                self.channelSockets[cname][event] = sockets;
            }
        }
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

_Socket.prototype.channel = function (name, options) {
    return this.client.Channel(name);
}

_Socket.prototype.tell = function (socket, name, event, data, action) {
    var tellBackData = {
        channel: name,
        event: event,
        data: data,
        action: action
    };
    socket.write(JSON.stringify(tellBackData));
}

module.exports = function (client, port, address) {
    return new _Socket(client, port, address);
}