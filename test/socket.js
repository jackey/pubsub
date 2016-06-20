var pubsub = require('../index');

var client = pubsub.Client({
    redis: 'redis://localhost:6379/0'
});

var server = client.socket(3230, '127.0.0.1');

server.start(function (err){
    console.log('socket listen on 3230');
});



