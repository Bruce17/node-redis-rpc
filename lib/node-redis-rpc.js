/**
 * @author Michael Raith <mia87@web.de>
 * @url    https://github.com/Bruce17
 * @date   2015-04-21 15:13:29
 */

var NRP = require('node-redis-pubsub');
var nodeUuid = require('uuid');


/**
 * Create a new NodeRedisRpc instance that can subscribe to channels and publish messages.
 *
 * @inheritDoc
 * @constructor
 */
function NodeRedisRpc () {
    'use strict';

    //// Inherit from "node redis pubsub" and extend everything needed for RPC ...
    NRP.apply(this, arguments);
}
NodeRedisRpc.prototype = NRP.prototype;


// Extend the original "publish" and call it later ...
NodeRedisRpc.prototype._emit = NodeRedisRpc.prototype.emit;

/**
 * Emit an (rpc) event
 *
 * @param {String} channel Channel on which to emit the message
 * @param {Object} message
 * @param {Object} options Optional options
 */
NodeRedisRpc.prototype.emit = function (channel, message, options) {
    'use strict';

    options = options || {};
    var rpcCallback = options.callback || function () {};

    // Extend original "publish" method to work for rpc calls
    if (options.type === 'rpc') {
        var self = this;
        var uuid = nodeUuid.v4();

        // Tell the responding method that we're executing a rpc request and want to receive a response.
        message.__type = 'rpc';
        message.__backChannel = uuid;

        

        // Register a callback handler for the rpc response.
        // Remove handler after response was received.
        self.on(uuid, function (data) {
            rpcCallback(data.err, data.result);

            // Unsubscribe rpc response handler
            self.off(uuid);
        });
    }

    // Trigger original method
    this._emit(channel, message);
};


// Extend the original "subscribe" and call it later ...
NodeRedisRpc.prototype._on = NodeRedisRpc.prototype.on;

/**
 * @inheritDoc
 */
NodeRedisRpc.prototype.on = function (channel, handler, callback) {
    'use strict';

    var self = this;

    

    /**
     * Wrap the original event handler.
     *
     * Argument params:
     *
     * @param {Object} message
     * @param {String} channel
     * @param {Function} rpc this rpc callback handler will be added by this function
     */
    var wrappedHandler = function (/*message, channel*/) {
        var args = Array.prototype.slice.apply(arguments);
        var message = args[0];

        var rpcCallbackHandler = function () {};

        

        // Check if event is of type "rpc".
        if ('__type' in message && message.__type === 'rpc') {
            // After the application executes the "done" handler,
            // the result will be trigger back to the "back channel" (rpc response).
            // After that step, the "rpc callback" handler will handle the result data.
            rpcCallbackHandler = function (err, result) {
                self.emit(
                    message.__backChannel,
                    {
                        err: err,
                        result: result
                    }
                );
            };
        }

        // Append our extended rpc callback handler
        args = [].concat(args, [rpcCallbackHandler]);

        // Call original handler with extended args
        handler.apply(null, args);
    };

    // Trigger original method
    this._on(channel, wrappedHandler, callback);
};

module.exports = NodeRedisRpc;
