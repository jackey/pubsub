var EventEmitter = require('events').EventEmitter;
var util = require('util');

function _Channel() {

}

util.inherits(EventEmitter, _Channel);

_Channel.prototype.sub = function (event, cb) {

}

_Channel.prototype.pub = function (event, data, cb) {

}

module.exports = _Channel;