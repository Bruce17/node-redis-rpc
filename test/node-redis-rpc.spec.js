var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.should();
chai.use(sinonChai);

var NodeRedisRpc = require('../index');

var conf = {port: 6379, scope: 'onescope'};
var conf2 = {port: 6379, scope: 'anotherscope'};

describe('Node Redis RPC', function () {
    var stubs = {};

    beforeEach(function () {
        stubs.consoleInfo = sinon.stub(console, 'info');
    });

    afterEach(function () {
        var key;
        for (key in stubs) {
            if (stubs.hasOwnProperty(key)) {
                stubs[key].restore();
            }
        }
    });

    // NOTICE: copied from "node redis pubsub"
    it('Should send and receive standard messages correctly', function (done) {
        var rq = new NodeRedisRpc(conf);

        rq.on('a test #1',
            function (data, channel) {
                data.first.should.equal('First message');
                data.second.should.equal('Second message');
                channel.should.equal('onescope:a test #1');
                done();
            },
            function () {
                rq.emit('a test #1', {
                    first: 'First message',
                    second: 'Second message'
                });
            }
        );
    });

    it('Should send and receive rpc messages correctly', function (done) {
        var rq = new NodeRedisRpc(conf);

        rq.on('a test #2',
            function (data, channel, rpcDone) {
                data.first.should.equal('First message');
                data.second.should.equal('Second message');
                channel.should.equal('onescope:a test #2');

                rpcDone(null, {rpcData: 'test test'});
            },
            function () {
                rq.emit('a test #2',
                    {
                        first: 'First message',
                        second: 'Second message'
                    },
                    {
                        type: 'rpc',
                        callback: function (err, result) {
                            expect(err).to.be.null;
                            expect(result).to.be.ok;
                            result.rpcData.should.equal('test test');

                            done();
                        }
                    }
                );
            }
        );
    });
});
