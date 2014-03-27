/*
 * gpromise
 * Simple "Promises/A+" implementation.
 * http://promises-aplus.github.io/promises-spec/
 *
 * https://github.com/goliatone/gpromise
 * Created with gbase.
 * Copyright (c) 2014 goliatone
 * Licensed under the MIT license.
 */
/* jshint strict: false, plusplus: true */
/*global define: false, require: false, module: false, exports: false */
(function (root, name, deps, factory) {
    "use strict";
    // Node
     if(typeof deps === 'function') {
        factory = deps;
        deps = [];
    }

    if (typeof exports === 'object') {
        module.exports = factory.apply(root, deps.map(require));
    } else if (typeof define === 'function' && 'amd' in define) {
        //require js, here we assume the file is named as the lower
        //case module name.
        define(name.toLowerCase(), deps, factory);
    } else {
        // Browser
        var d, i = 0, global = root, old = global[name], mod;
        while((d = deps[i]) !== undefined) deps[i++] = root[d];
        global[name] = mod = factory.apply(global, deps);
        //Export no 'conflict module', aliases the module.
        mod.noConflict = function(){
            global[name] = old;
            return mod;
        };
    }
}(this, "GPromise", function() {
///////////////////////////////////////////////////
// CONSTRUCTOR
///////////////////////////////////////////////////

    /**
     * GPromise constructor.
     * A promise is a value to be resolved in the future.
     * Promises can be in one of three states:
     * - pending
     * - resolved
     * - rejected
     * Once a promise is resolved, either by fullfilling it
     * or by rejecting it, a value must be set.
     *
     */
    var GPromise = function(){
        this.state = 'pending';

        this.value = null;

        this.callbacks = [];

        this.thenables = [];
    };

    /**
     * A promise must provide a then method to access
     * its current or eventual value or reason.
     * @param  {Function} onFullfilled Called once the
     *                                 promise is resolved.
     * @param  {Function} onRejected   Called once the
     *                                 promise is rejected
     * @return {GPromise}
     */
    GPromise.prototype.then = function(onFullfilled, onRejected){
        this.callbacks.push({resolve:onFullfilled, reject:onRejected});

        var thenPromise = new GPromise();

        this.thenables.push(thenPromise);

        if(this.state !== 'pending'){
            //exectue next frame.
            setTimeout(this._processQueue.bind(this), 0);
            // return thenPromise;
        }

        // return this;
        return thenPromise;
    };

    /**
     * Fullfill the promise with the given value.
     * @param  {Object} value
     * @return {this}
     */
    GPromise.prototype.resolve = function(value){
        return this.handle('resolve', value);
    };

    /**
     * Reject the promise with the give reason.
     * @param  {Object} value
     * @return {GPromise}
     */
    GPromise.prototype.reject = function(value){
        return this.handle('reject', value);
    };

    /**
     * Handles promise fulfillment.
     *  TODO: Consider make this private?
     *  `_handle.call(this, state, value)`
     *
     * @param  {String} state Either reject or solve
     * @param  {Object} value
     * @return {GPromise}
     * @private
     */
    GPromise.prototype.handle = function(state, value){
        if(this.state !== 'pending') return this;
        this.state = state;
        this.value = value;

        this._processQueue();

        return this;
    };

    /**
     * Passes the resolution of this promise
     * to another promise.
     * @param  {GPromise} promise
     * @return {GPromise}
     */
    GPromise.prototype.chain = function(promise){
        return this.then(promise.resolve.bind(promise),
                         promise.reject.bind(promise));
    };

    /**
     * Catches on rejection
     * @param  {Function} onRejected Callback for reject state
     * @return {GPromise}
     */
    GPromise.prototype['catch'] = function(onRejected){
        return this.then(null, onRejected);
    };

    /**
     * Process queued callbacks.
     * @private
     */
    GPromise.prototype._processQueue = function(){
        var callback;

        while(this.thenables.length){
            callback = this.callbacks.shift();

            this._executeCallback(callback[this.state]);
        }
    };

    /**
     * Executes all single promises.
     * @param   {Function} callback
     * @private
     */
    GPromise.prototype._executeCallback = function(callback){
        var then = this.thenables.shift();

        if(typeof callback !== 'function'){
            if(this.state.match(/resolve|reject/)) then[this.state](this.value);
            return;
        }

        try {
            var returned = callback(this.value);
            if(returned && typeof returned.then === 'function'){
                var rejectThenPromise  = function(value){then.reject(value)},
                    resolveThenPromise = function(value){then.resolve(value)};

                returned.then(resolveThenPromise, rejectThenPromise);
            } else then.resolve(returned);

        } catch(e){
            then.reject(e);
        }
    };

    /**
     * Wait for all these promises to complete. One failed => this fails too.
     */
    GPromise.when = function(all) {
        var promise = new this();
        var counter = 0;
        var results = [];

        for (var i=0; i<all.length; i++) {
            counter++;
            all[i].then(function(index, result) {
                results[index] = result;
                counter--;
                if (!counter) { promise.fulfill(results); }
            }.bind(null, i), function(reason) {
                counter = 1/0;
                promise.reject(reason);
            });
        }

        return promise;
    };

    return GPromise;
}));