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

    var promise = new GPromise();

    promise.reject('this always rejects').then(function(data) {
      console.log(data); // this is never called
    }).catch(function(err) {
      console.log(data);//this is called
    });

    promise = new GPromise();

    promise.resolve('this always resolves').then(function(data) {
      console.log(data); //this is called
    });
});