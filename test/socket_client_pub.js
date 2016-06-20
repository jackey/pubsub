// client

var pubsub_client = require('../client/socket')(3230);

pubsub_client.connect(function (socket) {
    var channel = pubsub_client.channel('product');
    channel.pub('add', {name: 'test product'}, function (res) {
        if (res['status'] == 'success') {
            console.log('pub success');
        }
    });

    channel.sub('add_success', function (res) {
        console.log(['add_success', res]);
    });
});


