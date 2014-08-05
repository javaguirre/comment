var bc = require('../lib/block-comment.js');

describe("block-command exposes", function() {

    it("activate() as a public function", function() {
        expect(typeof bc.toggle).toEqual('function');
    });

    it("toggle() as a public function", function() {
        expect(typeof bc.toggle).toEqual('function');
    });

});
