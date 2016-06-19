var pubsub = require('../index');

var client = pubsub.Client({
	redis: 'redis://localhost:6379/0'
});

// http server
var app = client.http();

var port = 8080;
var i = 0;
app.channel('product').sub('add', function (product) {
	app.response('product', 'add', {'add': 'success' + ++i});
});

app.listen(port, function (err) {
	if (!err) {
		console.log('pubsub listen on ' + port);
	}
	else {
		console.log('Start http server failed' + err);
	}
});


