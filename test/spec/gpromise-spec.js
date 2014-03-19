/*global define:true, describe:true , it:true , expect:true, 
beforeEach:true, sinon:true, spyOn:true , expect:true */
/* jshint strict: false */
define(['gpromise', 'jquery'], function(GPromise, $) {

    describe('just checking', function() {

        it('GPromise should be loaded', function() {
            expect(GPromise).toBeTruthy();
            var gpromise = new GPromise();
            expect(gpromise).toBeTruthy();
        });

        it('GPromise should initialize', function() {
            var gpromise = new GPromise();
            var output   = gpromise.init();
            var expected = 'This is just a stub!';
            expect(output).toEqual(expected);
        });
        
    });

});