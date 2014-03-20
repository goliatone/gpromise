/*global define:true requirejs:true*/
/* jshint strict: false */
requirejs.config({
    paths: {
        'jquery': 'jquery/jquery',
        'gpromise': 'gpromise'
    }
});

define(['gpromise', 'jquery'], function (GPromise, $) {
    console.log('Loading');
	var gpromise = new GPromise();
	gpromise.then((function(value){
        console.log('promise solved with', value, this);
    }).bind(gpromise), function(err){
        console.error(err);
    });

    gpromise.resolve(23);
});