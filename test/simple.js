var pubsub = require('../index');

var client = pubsub.Client({
	redis: 'redis://localhost:6379/0'
});

var productChan = client.Channel('product');
productChan.sub('add', function (err, product) {
	
});

// http server 
var app = client.http();
app.use('channel:product', function (req, res) {
	res.json({hello: 'world'});
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


