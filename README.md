# pubsub
A pub-sub system for node.js and redis

# 特性

* HTTP REST 支持

* 支持Socket 长链接 ; 支持Socket回调机制

* Redis 存储


# 快速上手

各种模式示例

## 同一进程内

```js
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

## HTTP REST 接口

```js
var pubsub = require('../index');

var client = pubsub.Client({
	redis: 'redis://localhost:6379/0'
});

var app = client.http();

var i = 0;
app.channel('product').sub('add', function (product) {
	app.response('product', 'add', {'add': 'success' + ++i});
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

```

## Socket 模式

### Server 端
```js
var pubsub = require('../index');

var client = pubsub.Client({
	redis: 'redis://localhost:6379/0'
});

var server = client.socket(3230, '127.0.0.1');

server.connect(function (socket) {
	var productChannel = server.channel(socket, 'product');

	productChannel.sub('add', function (product) {
		// TODO with product
		product['id'] = 10;

		productChannel.tell('add', product);

	});
});

server.start(function (err){
	console.log('socket listen on 3230');
});
```

### 客户端
```js

var pubsub_client = require('../client/socket')(3230);

pubsub_client.connect(function (socket) {
	var channel = pubsub_client.channel('product');
	channel.pub('add', {name: 'test product'}, function (res) {
		console.log('res: ' + JSON.stringify(res));
	});
});
```

# 接口


### pubsub.Client(redis_uri)
传递[redis_uri](https://www.iana.org/assignments/uri-schemes/prov/redis) 参数启动pubsub客户端实例

### 本地进程订阅发布事件

#### client.Channel(channel_name)
开启channel_name隧道 返回隧道实例

#### channel.sub(event, cb)
订阅event事件. cb 为事件处理函数

#### channel.pub(event, data, cb)
发布data数据到 event事件中

### HTTP REST 订阅发布事件

#### client.http() 
http 返回 express 的app实例. 但增加如下方法

#### app.channel('channel')
创建 HTTP Channel。 返回channel实例和 Client.Channel() 一致

#### app.response(channel_name, event, data)
HTTP 响应订阅事件处理结果. 该结果会被保存到redis中, 等待用户主动查询处理结果.

### socket模式订阅发布事件



# TODO

* HTTP REST 模式需要区分不同用户的事件发布和事件处理 避免不同用户互相覆盖处理结果

* Socket 模式断开后自动重连

* 增加日志处理

* 更多细节状态检测 




