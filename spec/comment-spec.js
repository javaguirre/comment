var bc = require('../lib/comment.js');

describe("comment exposes", function() {

    it("activate() as a public function", function() {
        expect(typeof bc.toggle).toEqual('function');
    });

    it("toggle() as a public function", function() {
        expect(typeof bc.toggle).toEqual('function');
    });

});
