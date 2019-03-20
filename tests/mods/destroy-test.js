
const TestedClass = require("../../lib/mods/destroy");

describe('Destroy', function() {
	it('not implemented', function(done) {
		var HpccClusterMock = {
    			mod: function() {}
    	};
		var oTested = new TestedClass( HpccClusterMock );
		oTested.destroy( {} ).then(function() {
			done('Expected rejection.');
		}, function( pError ) {
			done();
		})
	});
});
