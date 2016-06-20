// client

var pubsub_client = require('../client/socket')(3230);

pubsub_client.connect(function (socket) {
    var channel = pubsub_client.channel('product');
    channel.sub('add', function (res) {
        res['id'] = 1;
        channel.pub('add_success', res, function (res) {
            if (res['status'] == 'success') {
                console.log('pub add_success success');
            }
        });
    });
});


