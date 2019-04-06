const SimpleLogger = require('../../lib/logger');
const Logger = new SimpleLogger();

const UtilsClass = new require('../../lib/utils');
const Utils = new UtilsClass();

const TestedClass = require("../../lib/mods/scp");

const assert = require('chai').assert;
const path = require('path');


describe('Scp',function(){
	before(function(done){
		done();
	});
	
	after(function(done) {
		done();
	});
	
	it('must specify username', function(done) {
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
    				pCallback( null, "", null, {}, {} );
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, Utils, SSHClientMock );
		
    	var oParams = {
    			source: "/tmp/test.txt",
    			target: "@master:/tmp/target.txt"
    	};
    	oTested.handle( { KeyPairFile: path.resolve(__dirname, 'test.key') }, oParams ).then( function( data ) {
    		done('Expected error');
    	}, function( err ) {
    		done();
    	});
	});
	
	it('error throws from ssh client', function(done) {
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
    				throw new Error('test error');
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, Utils, SSHClientMock );
		
    	var oParams = {
    			source: "/tmp/test.txt",
    			target: "ec2-user@master:/tmp/target.txt"
    	};
    	oTested.handle( { KeyPairFile: path.resolve(__dirname, 'test.key') }, oParams ).then( function( data ) {
    		done('Expected error');
    	}, function( err ) {
    		done();
    	});
	});
	
	it('error in ssh client', function(done) {
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
    				pCallback( new Error('test error'), null, 'error', {}, {} );
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, Utils, SSHClientMock );
		
    	var oParams = {
    			source: "/tmp/test.txt",
    			target: "ec2-user@master:/tmp/target.txt"
    	};
    	oTested.handle( { KeyPairFile: path.resolve(__dirname, 'test.key') }, oParams ).then( function( data ) {
    		done('Expected error');
    	}, function( err ) {
    		done();
    	});
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
    				assert.include( pOpts, { host: '9.10.11.12', username: 'ec2-user' });
    				pCallback( null, "", null, {}, {} );
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, Utils, SSHClientMock );
		
    	var oParams = {
    			source: "/tmp/test.txt",
    			target: "ec2-user@master:/tmp/target.txt"
    	};
    	oTested.handle( { KeyPairFile: path.resolve(__dirname, 'test.key') }, oParams ).then( function( data ) {
    		done();
    	}, function( err ) {
    		done( err );
    	});
	});
	
	it('ip only', function(done) {
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
    				assert.include( pOpts, { host: '1.1.1.1', username: 'ec2-user' });
    				pCallback( null, "", null, {}, {} );
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, Utils, SSHClientMock );
		
    	var oParams = {
    			source: "/tmp/test.txt",
    			target: "ec2-user@1.1.1.1:/tmp/target.txt"
    	};
    	oTested.handle( { KeyPairFile: path.resolve(__dirname, 'test.key') }, oParams ).then( function( data ) {
    		done();
    	}, function( err ) {
    		done( err );
    	});
	});
	
	it('target dir only', function(done) {
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
    				assert.include( pOpts, { host: '1.1.1.1', username: 'ec2-user' });
    				pCallback( null, "", null, {}, {} );
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, Utils, SSHClientMock );
		
    	var oParams = {
    			source: "/tmp/test.txt",
    			target: "ec2-user@1.1.1.1:/tmp/"
    	};
    	oTested.handle( { KeyPairFile: path.resolve(__dirname, 'test.key') }, oParams ).then( function( data ) {
    		done();
    	}, function( err ) {
    		done( err );
    	});
	});
});
