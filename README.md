# NRR (node redis RPC)

Simple rpc for node using redis. This library extends [node redis pubsub](https://www.npmjs.com/package/node-redis-pubsub)
and uses its feature as a base. It uses the existing methods `on/subscribe` / `emit/publish` to realize a simple rpc
over redis and between node.js instances. Every node.js instance can connect to the event bus, listen to the bus via
pub/sub or register/trigger rpc calls.


[![npm package](https://img.shields.io/npm/v/node-redis-rpc.svg?style=flat-square)](https://www.npmjs.org/package/node-redis-rpc)
[![Dependency Status](https://david-dm.org/Bruce17/node-redis-rpc.svg?style=flat-square)](https://david-dm.org/Bruce17/node-redis-rpc)
[![devDependency Status](https://david-dm.org/Bruce17/node-redis-rpc/dev-status.svg?style=flat-square)](https://david-dm.org/Bruce17/node-redis-rpc#info=devDependencies)
[![code climate](https://img.shields.io/codeclimate/github/Bruce17/node-redis-rpc.svg?style=flat-square)](https://codeclimate.com/github/Bruce17/node-redis-rpc)
[![Coverage Status](https://coveralls.io/repos/github/Bruce17/node-redis-rpc/badge.svg?branch=master)](https://coveralls.io/github/Bruce17/node-redis-rpc?branch=master)
[![Travis CI](https://travis-ci.org/Bruce17/node-redis-rpc.svg?style=flat-square)](https://travis-ci.org/Bruce17/node-redis-rpc)


## Important Changes
- 1.0.8 update `README.md` & `.npmignore` file
- 1.0.7 updated dependencies
- 1.0.6 removed automatic npm publish from travis
- 1.0.5 updated gruntfile build process, added more comments
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
    auth: 'password',  // optional password
    scope: 'test'      // use scope to prevent sharing messages between "node redis rpc"
};
var nodeRedisRpcInst = new NodeRedisRpc(config);
```

### Simple rpc

```javascript
// Register a listener on the channel "foo:bar" [1]
nodeRedisRpcInst.on('foo:bar', function (data, channel, done) {
    // do s.th. ...
    
    // Trigger done handler to fire back rpc result [2]
    // - first arg:  error status
    // - second arg: result data
    done(null, {num: 123, ary: [1,2,3,4], text: 'hello'});
});

/**
 * RPC callback handler [3]
 *
 * @param {null|*} err    error status
 * @param {*}      result result data returned by the rpc callback (see [2])
 */
var myRpcCallback = function (err, result) {
    console.log('err', err);       // outputs: 'null'
    console.log('result', result); // outputs: '{foo: 'bar', num: 123}'
};

// Trigger an event on the channel "foo:bar" (received by [1])
nodeRedisRpcInst.emit(
    'foo:bar',      // channel
    {name: 'Hans'}, // message data
    {               // options
        type: 'rpc',            // trigger an event of type "rpc"
        callback: myRpcCallback // register a callback handler [3] to be executed when the rpc result returns
    }
);
```

### More

Please see [node redis pubsub](https://www.npmjs.com/package/node-redis-pubsub) for more information on how to use
this package's base package e.g. unsubscrbe to a channel.
