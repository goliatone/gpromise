/*global define:true requirejs:true*/
/* jshint strict: false */
requirejs.config({
    paths: {
        'jquery': '../lib/jquery/jquery',
        'gpromise': '../src/gpromise'
    }
});

define(['gpromise', 'jquery'], function (GPromise, $) {
    console.log('Loading');
	var gpromise = new GPromise();
	gpromise.init();
});