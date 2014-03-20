/*
 * gpromise
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

    /**
     * Extend method.
     * @param  {Object} target Source object
     * @return {Object}        Resulting object from
     *                         meging target to params.
     */
    var _extend = function(target) {
        var i = 1, length = arguments.length, source;
        for ( ; i < length; i++ ) {
            // Only deal with defined values
            if ((source = arguments[i]) != undefined ){
                Object.getOwnPropertyNames(source).forEach(function(k){
                    var d = Object.getOwnPropertyDescriptor(source, k) || {value:source[k]};
                    if (d.get) {
                        target.__defineGetter__(k, d.get);
                        if (d.set) target.__defineSetter__(k, d.set);
                    } else if (target !== d.value) target[k] = d.value;
                });
            }
        }
        return target;
    };

    /**
     * Proxy method
     * @param  {Function} fn      Function to be proxied
     * @param  {Object}   context Context for the method.
     */
    var _proxy = function( fn, context ) {
        var tmp, args, proxy, slice = Array.prototype.slice;

        if ( typeof context === "string" ) {
            tmp = fn[ context ];
            context = fn;
            fn = tmp;
        }

        if ( ! typeof(fn) === 'function') return undefined;

        args = slice.call(arguments, 2);
        proxy = function() {
            return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
        };

        return proxy;
    };


///////////////////////////////////////////////////
// CONSTRUCTOR
///////////////////////////////////////////////////

	var options = {

    };

    /**
     * GPromise constructor
     *
     * @param  {object} config Configuration object.
     */
    var GPromise = function(config){
        _extend(options, config || {});
        this.init();
    };

///////////////////////////////////////////////////
// PRIVATE METHODS
///////////////////////////////////////////////////

    GPromise.prototype.init = function(){
        if(this.initialized) return this;
        this.initialized = true;

        this.value = 'empty';
        this.value = null;

        this.states= ['resolve', 'reject'];

        this.callbacks = [];

        this.thenables = [];
    };


    GPromise.prototype.then = function(onFullfilled, onRejected){
        this.callbacks.push({resolve:onFullfilled, reject:onRejected});

        var thenPromise = new GPromise();

        this.thenables.push(thenPromise);

        if(this.value !== 'empty'){
            //exectue next frame.
            setTimeout(this._processQueue.bind(this), 0);
        }

        return thenPromise;
    };

    GPromise.prototype.resolve = function(value){
        return this.handle('resolve', value);
    };

    GPromise.prototype.reject = function(value){
        return this.handle('reject', value);
    };

    //TODO: Consider make this private? _handle.call(this, state, value)
    GPromise.prototype.handle = function(state, value){
        if(this.state !== 'empty') return this;
        this.state = state;
        this.value = value;

        this._processQueue();

        return this;
    };

    GPromise.prototype.chain = function(promise){
        return this.then(promise.resolve.bind(promise),
                         promise.reject.bind(promise));
    };

    GPromise.prototype.catch = function(onRejected){
        return this.then(null, onRejected);
    };

    GPromise.prototype._processQueue = function(){
        var onFullfilled, onRejected, callback;
        while(this.thenables.length){
            callback = this.callbacks.shift();
            this._executeCallback(callback[this.state]);
        }
    };

    GPromise.prototype._executeCallback = function(callback){
        var then = this.thenables.shift();

        if(typeof callback !== 'function'){
            if(this.state.match(/resolve|reject/)) then[this.state](this.value);
            return;
        }

        try {
            var returned = callback(this.value);
            if(returned && typeof returned.then === 'function'){
                var rejectThenPromise   = function(value){then.reject(value)},
                    resolveThenPromise = function(value){then.resolve(value)};

                returned.then(resolveThenPromise, rejectThenPromise);
            } else then.resolve(returned);

        } catch(e){
            then.reject(e);
        }
    };





    return GPromise;
}));