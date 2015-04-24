var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

//we have to globally declare the modules
global.NodeRedisRpc = require('../index');
global.NRP = require('node-redis-pubsub');
global.config = {
    host: 'localhost', // redis server hostname
    port: 6379,        // redis server port
    scope: 'test'      // use scope to prevent sharing messages between "node redis rpc"
};
global.nrp = new NRP(global.config);
global.nodeRedisRpcInst = new NodeRedisRpc(global.config);


global.myRpcCallback = function (err, result) {
    console.log('err', err);
    console.log('result', result);
};


//output helper functions
var startBench = function (event) {
    //console.log('bench "%s" started', event.target.name);
};
var cycleBench = function (event) {
    console.log('bench "%s" cycle %s', event.target.name, event.target.cycles);
};
var abortBench = function (event) {
    console.log('bench "%s" aborted', event.target.name);
};
var errorBench = function (event) {
    console.log('bench "%s" failed! Message: %s', event.target.name, event.message);
};
var resetBench = function (event) {
    console.log('bench "%s" resetted', event.target.name);
};
var completeBench = function (event) {
    //console.log('bench "%s" finished', event.target.name);
};


// define the benchmark suite with several benchmarks
suite
    // first benchmark the pub/sub package
    .add({
        'name': 'simple pub sub',
        'defer': true,
        'fn': function (deferred) {
            global.nrp.on('say_hello', function (data) {
                //console.log(data.name);
                //global.nrp.off('say_hello');
                deferred.resolve();
            });
            global.nrp.emit('say_hello', {name: 'Ray'});
        },
        'setup': function () {
        },
        'teardown': function () {
            global.nrp.off('say_hello');
            //global.nrp.quit();
        },
        'onStart': startBench,
        'onCycle': cycleBench,
        'onAbort': abortBench,
        'onError': errorBench,
        'onReset': resetBench,
        'onComplete': completeBench
    })

    // then benchmark the pub/sub behaviour with the rpc package on top
    .add({
        'name': 'simple pub sub with rpc package',
        'defer': true,
        'fn': function (deferred) {
            global.nodeRedisRpcInst.on('channel1', function (data, channel, done) {
                //console.log(data);
                deferred.resolve();
            });
            global.nodeRedisRpcInst.emit(
                'channel1',
                {channel: 'channel1', test: 'simple pub sub with rpc package'}
            );
        },
        'setup': function () {
        },
        'teardown': function () {
            global.nodeRedisRpcInst.off('channel1');
            //global.nodeRedisRpcInst.quit();
        },
        'onStart': startBench,
        'onCycle': cycleBench,
        'onAbort': abortBench,
        'onError': errorBench,
        'onReset': resetBench,
        'onComplete': completeBench
    })

    // then benchmark a simple rpc call
    .add({
        'name': 'simple rpc call',
        'defer': true,
        'fn': function (deferred) {
            global.nodeRedisRpcInst.on('channel1', function (data, channel, done) {
                //console.log(data);
                done(null, {foo: 'bar', num: 123});
            });
            global.nodeRedisRpcInst.emit(
                'channel1',
                {channel: 'channel1', test: 'simple rpc call'},
                {type: 'rpc', callback: function(){
                    deferred.resolve();
                }}
            );
        },
        'setup': function () {
        },
        'teardown': function () {
            global.nodeRedisRpcInst.off('channel1');
            //global.nodeRedisRpcInst.quit();
        },
        'onStart': startBench,
        'onCycle': cycleBench,
        'onAbort': abortBench,
        'onError': errorBench,
        'onReset': resetBench,
        'onComplete': completeBench
    })

    // add listeners
    .on('cycle', function (event) {
        console.log(String(event.target));
    })
    .on('complete', function () {
        console.log('Fastest is %s', this.filter('fastest').pluck('name'));
        console.log('Slowest is %s', this.filter('slowest').pluck('name'));
        console.log('Successful: %s', this.filter('successful').pluck('name'));
    })
    // run async
    .run({'async': true});