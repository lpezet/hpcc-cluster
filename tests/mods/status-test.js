const Fs = require('fs');
const SimpleLogger = require('../../lib/logger');
//var exec = require('child_process').exec
const AWS = require('aws-sdk');

//const Promise = require("promised-io/promise").Promise;
//const yaml = require('js-yaml');
const { yamlParse } = require('yaml-cfn');
const path = require('path');
//const util = require('util');
//const when = require("promised-io/promise").when;
//const PromiseAll = require("promised-io/promise").all;

const chai = require('chai');
const assert = chai.assert
const spies = require('chai-spies');
chai.use(spies);
const expect = chai.expect;

//const TEST_DIR = process.cwd();
//if ( ! Fs.existsSync( TEST_DIR ) ) Fs.mkdirSync( TEST_DIR );
const TEST_CONFIG_FILE_PATH = path.resolve(__dirname, "test.cluster.config");
var oClusterConfig = yamlParse( Fs.readFileSync( TEST_CONFIG_FILE_PATH, {encoding: 'utf8'}) );


const Logger = new SimpleLogger();

const TestedClass = require("../../lib/mods/status");

/*
const HandlerClass = require('../../lib/handler');

class DefaultErrorHandler extends HandlerClass {
    doHandle( pError, pPromise, pHandlerChain ) {
            //console.log('DefaultErrorHandler!!!');
            winston.log('error', pError);
            if ( pPromise ) pPromise.reject( pError );
            // Assumption is this is the last error handler.
    }
}

//const DEFAULT_ERROR_HANDLER = new DefaultErrorHandler();
//const HpccClusterClass = require("../../lib/hpcc-cluster");
//const UtilsClass = new require('../../lib/utils');
//const Utils = new UtilsClass( DEFAULT_ERROR_HANDLER );
*/

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
 * Status
 * ======================================================
 */
describe('Status',function(){
	
	HpccClusterClass = {
			mod: function() {}
	}
	
	
	before(function(done){
		//this.modStub = sinon.stub(HpccClusterClass.prototype, 'mod');
		done();
	});
	
	after(function(done) {
		//assert( this.modStub.called );
		//HpccClusterClass.prototype.mod.restore();
		done();
	});
	
	it('mod', function() {
		var called = false;
		var HpccClusterMock = {
				mod: function() {
					called = true;
				}
		}
		new TestedClass( HpccClusterMock );
		assert.isTrue( called );
	});
	
	it('should get status',function(done){
    	var HpccClusterMock = {
    			mod: function() {},
    			save_state: function() {
    				return Promise.resolve();
    			}
    	}
    	var UtilsMock = {
    	};
    	
    	var CloudClientMock = {
    			stack_exists: function() {
    				return Promise.resolve();
    			},
    			get_all_ec2_instance_ids_from_cluster: function() {
    				return Promise.resolve( ['abc', 'def' ]);
    			},
    			describe_ec2_status: function( pEC2Client, pInstanceIds, pOutputToConsole ) {
    				return Promise.resolve('TODO: dunno what data looks like.');
    			}
    	};
    	
    	const SaveStateSpy = chai.spy.on(HpccClusterMock, 'save_state');
    	
		var oTested = new TestedClass( HpccClusterMock, Logger, UtilsMock, CloudClientMock ); //, CF, EC2 );
		
		var options = { parent: {} };
    	var oActual = oTested.handle( oClusterConfig, options );
    	
    	oActual.then( function() {
    		try {
    			expect(SaveStateSpy).to.have.been.called();
    			done();
    		} catch(e) {
    			done(e);
    		}
    	}, function( pError ) {
    		console.error( pError );
    		done( pError );
    	});
    	
	});
});
