const SimpleLogger = require('../../lib/logger');
const Logger = new SimpleLogger();

const UtilsClass = new require('../../lib/utils');
const Utils = new UtilsClass();

const TestedClass = require("../../lib/mods/scp");

const assert = require('chai').assert;


describe('Scp',function(){
	before(function(done){
		done();
	});
	
	after(function(done) {
		done();
	});
	
	it('basic', function(done) {
		var HpccClusterMock = {
    			mod: function() {},
    			get_state: function() {
    				return Promise.resolve({Topology: {
    					"slave00001": { NetworkInterfaces: [ { Association: { PublicIp: "1.2.3.4" } } ] },
    					"slave00002": { NetworkInterfaces: [ { Association: { PublicIp: "5.6.7.8" } } ] },
    					"master": { NetworkInterfaces: [ { Association: { PublicIp: "9.10.11.12" } } ] }
    				}})
    			}
    	}
		
    	var SSHClientMock = {
    			scpFile: function( pOpts, pTarget, pSource, pCallback ) {
    				assert.include( pOpts, { host: '9.10.11.12', username: 'hpccdemo' });
    				pCallback( null, "", null, {}, {} );
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, Utils, SSHClientMock );
		
    	var oParams = {
    			source: "/tmp/test.txt",
    			target: "hpccdemo@master:/tmp/target.txt"
    	};
    	oTested.scp( { KeyPairFile: '/dev/null' }, oParams ).then( function( data ) {
    		done();
    	}, function( err ) {
    		done( err );
    	});
	});
});
