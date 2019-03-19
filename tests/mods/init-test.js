const Fs = require('fs');
var exec = require('child_process').exec
const AWS = require('aws-sdk');

//const Promise = require("promised-io/promise").Promise;
//const yaml = require('js-yaml');
//const { yamlParse } = require('yaml-cfn');
const path = require('path');
//const util = require('util');
//const winston = require('winston');
//const when = require("promised-io/promise").when;
//const PromiseAll = require("promised-io/promise").all;

const SimpleLogger = require('../../lib/logger');
const Logger = new SimpleLogger();

//const assert = require('assert');
//const sinon = require('sinon');
//if ( ! Fs.existsSync( TEST_DIR ) ) Fs.mkdirSync( TEST_DIR );
//const TEST_CONFIG_FILE_PATH = path.resolve(__dirname, "test.cluster.config");
//var oClusterConfig = yamlParse( Fs.readFileSync( TEST_CONFIG_FILE_PATH, {encoding: 'utf8'}) );

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
const UtilsClass = new require('../../lib/utils');
const Utils = new UtilsClass( DEFAULT_ERROR_HANDLER );
*/

const TestedClass = require("../../lib/mods/init");

const TEST_DIR = process.cwd();
const CLUSTER_CONFIG_FILE = path.resolve(TEST_DIR, "cluster.config");
const MY_CONFIG_FILE = path.resolve(TEST_DIR, "my.config");
const WORK_DIR = path.resolve( TEST_DIR, ".hpcc-cluster");


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

rmdirR = function( pPath ) {
	return exec('rm -rf ' + pPath,function(err,out) { 
	  console.log(out); err && console.log(err); 
	});
};

clearHpccClusterInit = function() {
	if (Fs.existsSync( WORK_DIR )) rmdirR( WORK_DIR );
	if (Fs.existsSync( CLUSTER_CONFIG_FILE )) Fs.unlinkSync( CLUSTER_CONFIG_FILE );
	if (Fs.existsSync( MY_CONFIG_FILE )) Fs.unlinkSync( MY_CONFIG_FILE );
}




/* 
 * ======================================================
 * Init
 * ======================================================
 */
describe('Init',function(){
	
	beforeEach(function(done) {
		clearHpccClusterInit();
		//this.modStub = sinon.stub(HpccClusterClass.prototype, 'mod');
		done();
	});
	
	afterEach(function(done) {
		//assert( this.modStub.called );
		//HpccClusterClass.prototype.mod.restore();
		clearHpccClusterInit();
		done();
	});
	
	it('should create config file',function(done){
		//var HpccCluster = new HpccClusterClass(DEFAULT_ERROR_HANDLER, Utils);
		var HpccClusterMock = {
    			mod: function() {}
				/*
    			save_state: function() {
    				return Promise.resolve();
    			}
    			*/
    	}
		
		var oTested = new TestedClass( HpccClusterMock, Logger );
		//TODO: test init() method added to HpccCluster?
		
		var options = { parent: {} };
		options.WorkDir = WORK_DIR;
    	var oInit = oTested.init( options );
    	oInit.then( function() {
    		if ( ! Fs.existsSync( WORK_DIR ) ) {
    			done('Work dir missing.')
    		} else if ( ! Fs.existsSync( CLUSTER_CONFIG_FILE ) ) {
    			done('Missing Cluster config file.');
    		} else if( ! Fs.existsSync( MY_CONFIG_FILE ) ) {
    			done('Missing my config file.');
    		} else {
    			done();
    		}
    	}, function( err ) {
    		done(err);
    	});
	});
	
	it('reject when creating config file more than once',function(done){
		//var HpccCluster = new HpccClusterClass(DEFAULT_ERROR_HANDLER, Utils);
		var HpccClusterMock = {
    			mod: function() {}
				/*
    			save_state: function() {
    				return Promise.resolve();
    			}
    			*/
    	}
		
		var oTested = new TestedClass( HpccClusterMock, Logger );
		//TODO: test init() method added to HpccCluster?
		
		var options = { parent: {} };
		options.WorkDir = WORK_DIR;
    	oTested.init( options ).then( function() {
    		oTested.init( options ).then( function() {
    			done('Expecting rejection.');
    		}, function( err2 ) {
    			done();
    		})
    	}, function( err ) {
    		done(err);
    	});
	});
});
