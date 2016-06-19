var pubsub = require('../index');

var client = pubsub.Client({
    redis: 'redis://localhost:6379/0'
});

var productChan = client.Channel('product');
productChan.sub('add', function (product) {
    console.log(['sub', 'add', 'product', product]);
});

productChan.pub('add', {name: 'test product name'});


