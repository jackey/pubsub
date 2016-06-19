# pubsub
A pub-sub system for node.js and redis

# 特性

    * HTTP REST 支持

    * 支持Socket 长链接 ; 支持Socket回调机制

    * Redis 存储
	
＃ 快速上手

## 同一进程内

```
var pubsub = require('pubsub');

var client = pubsub.Client({
	redis: 'redis://localhost:6379/0'
});

var productChan = client.Channel('product');
productChan.sub('add', function (product) {
	console.log(['sub', 'add', 'product', product]);
});

productChan.pub('add', {name: 'test product name'});

```

