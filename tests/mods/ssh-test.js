const Fs = require('fs');
//var exec = require('child_process').exec
const AWS = require('aws-sdk');

//const Promise = require("promised-io/promise").Promise;
//const yaml = require('js-yaml');
const { yamlParse } = require('yaml-cfn');
const path = require('path');
//const util = require('util');
//const when = require("promised-io/promise").when;
//const PromiseAll = require("promised-io/promise").all;

const SimpleLogger = require('../../lib/logger');
const Logger = new SimpleLogger();

//const assert = require('assert');
//const sinon = require('sinon');
//const TEST_DIR = process.cwd();
//if ( ! Fs.existsSync( TEST_DIR ) ) Fs.mkdirSync( TEST_DIR );
const TEST_CONFIG_FILE_PATH = path.resolve(__dirname, "test.cluster.config");
var oClusterConfig = yamlParse( Fs.readFileSync( TEST_CONFIG_FILE_PATH, {encoding: 'utf8'}) );
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

const DEFAULT_ERROR_HANDLER = new DefaultErrorHandler();


const HpccClusterClass = require("../../lib/hpcc-cluster");

*/

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
	
	//var execStub;
	
	before(function(done){
		//this.modStub = sinon.stub(HpccClusterClass.prototype, 'mod');
		done();
	});
	
	after(function(done) {
		//assert( this.modStub.called );
		//HpccClusterClass.prototype.mod.restore();
		//if (execStub) execStub.restore();
		done();
	});

	it('should ssh',function(done){
		
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
					return Promise.resolve();
				}
		};
		
    	//var SSH = require('ssh2-client');
    	//var SSHClient = require('ssh2').Client;
    	/*
    	execStub = sinon.stub(SSH, 'exec');
    	execStub.callsFake( function( uri, cmd, opts ) {
    		return {
    			then: function( pFunction ) {
    				pFunction();
    				return this;
    			},
    			catch: function( pFunction ) {
    				return this;
    			}
    		}
    	});
    	var HpccCluster = new HpccClusterClass(DEFAULT_ERROR_HANDLER, Utils);
    	*/
    	
		var oTested = new TestedClass( HpccClusterMock, Logger, Utils, SSHClientMock );
		
    	
    	var options = { parent: {}, target: 'slave', cmd:'hostname' };
    	oTested.ssh( oClusterConfig, options );
    	
    	done();
    	
	});
});
