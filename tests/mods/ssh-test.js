const Fs = require('fs');
const AWS = require('aws-sdk');

const { yamlParse } = require('yaml-cfn');
const path = require('path');

const SimpleLogger = require('../../lib/logger');
const Logger = new SimpleLogger();

const TEST_CONFIG_FILE_PATH = path.resolve(__dirname, "test.cluster.config");
var oClusterConfig = yamlParse( Fs.readFileSync( TEST_CONFIG_FILE_PATH, {encoding: 'utf8'}) );

const UtilsClass = new require('../../lib/utils');
const Utils = new UtilsClass();

const TestedClass = require("../../lib/mods/ssh");


beforeEach(function(done) {
	AWS.config.update({
	    paramValidation: false,
	    region: 'mock-region',
	    credentials: {
	      accessKeyId: 'akid',
	      secretAccessKey: 'secret',
	      sessionToken: 'session'
	    }
	  });
	done();
});

/* 
 * ======================================================
 * Ssh
 * ======================================================
 */
describe('Ssh',function(){
	
	before(function(done){
		done();
	});
	
	after(function(done) {
		done();
	});
	
	it('shell get_state error thrown',function(done){
		var HpccClusterMock = {
    			mod: function() {},
    			save_state: function() {
    				return Promise.resolve();
    			},
    			get_state: function() {
    				throw new Error('Test error');
    			}
    	}
		
		var SSHClientMock = {
				shell: function( pOpts, pCallback) {
					pCallback( new Error('Test error'));
				}
		};
    	
		var oTested = new TestedClass( HpccClusterMock, Logger, Utils, SSHClientMock );
    	var options = { parent: {}, target: 'slave', cmd:'hostname' };
    	oTested.handle( oClusterConfig, options ).then( function() {
    		done('Expecting rejection.');
    	}, function( pError ) {
    		done();
    	});	
	});
	
	it('shell get_state error',function(done){
		var HpccClusterMock = {
    			mod: function() {},
    			save_state: function() {
    				return Promise.resolve();
    			},
    			get_state: function() {
    				return Promise.reject(new Error('Test error'));
    			}
    	}
		
		var SSHClientMock = {
				shell: function( pOpts, pCallback) {
					pCallback( new Error('Test error'));
				}
		};
    	
		var oTested = new TestedClass( HpccClusterMock, Logger, Utils, SSHClientMock );
    	var options = { parent: {}, target: 'slave', cmd:'hostname' };
    	oTested.handle( oClusterConfig, options ).then( function() {
    		done('Expecting rejection.');
    	}, function( pError ) {
    		done();
    	});	
	});
	
	it('shell error',function(done){
		var HpccClusterMock = {
    			mod: function() {},
    			save_state: function() {
    				return Promise.resolve();
    			},
    			get_state: function() {
    				return Promise.resolve();
    			}
    	}
		
		var SSHClientMock = {
				shell: function( pOpts, pCallback) {
					pCallback( new Error('Test error'));
				}
		};
    	
		var oTested = new TestedClass( HpccClusterMock, Logger, Utils, SSHClientMock );
    	var options = { parent: {}, target: 'slave', cmd:'hostname' };
    	oTested.handle( oClusterConfig, options ).then( function() {
    		done('Expecting rejection.');
    	}, function( pError ) {
    		done();
    	});	
	});
	
	it('shell error thrown',function(done){
		var HpccClusterMock = {
    			mod: function() {},
    			save_state: function() {
    				return Promise.resolve();
    			},
    			get_state: function() {
    				return Promise.resolve();
    			}
    	}
		
		var SSHClientMock = {
				shell: function() {
					throw new Error();
				}
		};
    	
		var oTested = new TestedClass( HpccClusterMock, Logger, Utils, SSHClientMock );
    	var options = { parent: {}, target: 'slave', cmd:'hostname' };
    	oTested.handle( oClusterConfig, options ).then( function() {
    		done('Expecting rejection.');
    	}, function( pError ) {
    		done();
    	});	
	});

	it('basic',function(done){
		var HpccClusterMock = {
    			mod: function() {},
    			save_state: function() {
    				return Promise.resolve();
    			},
    			get_state: function() {
    				return Promise.resolve();
    			}
    	}
		
		var SSHClientMock = {
				shell: function( pOpts, pCallback ) {
					pCallback();
				}
		};
    	
		var oTested = new TestedClass( HpccClusterMock, Logger, Utils, SSHClientMock );
    	var options = { parent: {}, target: 'slave', cmd:'hostname' };
    	oClusterConfig.KeyPairFile = path.resolve( __dirname, 'test.key' ); 
    	oTested.handle( oClusterConfig, options ).then( function() {
    		done();
    	}, function( pError ) {
    		done( pError );
    	});	
	});
});
