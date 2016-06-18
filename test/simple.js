var pubsub = require('../index');

var client = pubsub.Client({
	redis: 'redis://localhost:6379/0'
});

var productChan = client.Channel('product');
productChan.sub('add', function (product) {
	console.log(['sub', 'add', 'product', product]);
});

productChan.pub('add', {name: 'test product name'});

// http server
var app = client.http();

app.get('/channel/:channel_name/pub/:event', function (req, res) {
	var channel_name = req.params.channel_name;
	var event = req.params.event;
	var data = req.body;

	var channel = client.Channel(channel_name);
	channel.pub(event, data);

	res.json({channel_name: channel_name, event: event});
});

var port = 8080;
app.listen(port, function (err) {
	if (!err) {
		console.log('pubsub listen on ' + port);
	}
	else {
		console.log('Start http server failed' + err);
	}
});


