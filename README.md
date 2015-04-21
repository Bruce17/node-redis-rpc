[![npm package](https://img.shields.io/npm/v/node-redis-rpc.svg?style=flat-square)](https://www.npmjs.org/package/node-redis-rpc)
[![Dependency Status](https://david-dm.org/Bruce17/node-redis-rpc.svg?style=flat-square)](https://david-dm.org/Bruce17/node-redis-rpc)
[![devDependency Status](https://david-dm.org/Bruce17/node-redis-rpc/dev-status.svg?style=flat-square)](https://david-dm.org/Bruce17/node-redis-rpc#info=devDependencies)
[![code climate](https://img.shields.io/codeclimate/github/Bruce17/node-redis-rpc.svg?style=flat-square)](https://codeclimate.com/github/Bruce17/node-redis-rpc)
[![Travis CI](https://travis-ci.org/Bruce17/node-redis-rpc.svg?style=flat-square)](https://travis-ci.org/Bruce17/node-redis-rpc)

NRR (node redis RPC)
====================

Simple rpc for node using redis. This library extends [node redis pubsub](https://www.npmjs.com/package/node-redis-pubsub)
and uses its feature as a base. It uses the existing methods `on/subscribe` / `emit/publish` to realize a simple rpc
over redis and between node.js instances. Every node.js instance can connect to the event bus, listen to the bus via
pub/sub or register/trigger rpc calls.

## Important Changes
- 1.0.4 added redis server to the travis build environment (for tests only)
- 1.0.3 adjusted travis config and unit tests
- 1.0.2 minor changes, added status icons, added travis support
- 1.0.0 first commit


## Install

```bash
$ npm install node-redis-rpc
```

## Usage
### Setup

```javascript
var NodeRedisRpc = require('node-redis-rpc');
var config = {
    host: 'localhost', // redis server hostname
    port: 6379,        // redis server port
    auth: 'password',   // optional password
    scope: 'test'      // use scope to prevent sharing messages between "node redis rpc"
};
var nodeRedisRpcInst = new NodeRedisRpc(config);
```

### Simple rpc

```javascript
nodeRedisRpcInst.on('foo:bar', function (data, channel, done) {
    // do s.th. ...
    
    done(null, {foo: 'bar', num: 123});
});

var myRpcCallback = function (err, result) {
    console.log('err', err);       // outputs: 'null'
    console.log('result', result); // outputs: '{foo: 'bar', num: 123}'
};

nodeRedisRpcInst.emit(
    'foo:bar',
    {name: 'Hans'},
    {type: 'rpc', callback: myRpcCallback}
);
```

### More

Please see [node redis pubsub](https://www.npmjs.com/package/node-redis-pubsub) for more information on how to use
this package's base package e.g. unsubscrbe to a channel.
