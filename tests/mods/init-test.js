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
const Promises = require('../../lib/promises');

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

/* 
 * ======================================================
 * Init
 * ======================================================
 */
describe('Init',function() {

	var rmdirR = function( pPath ) {
		return new Promise( function(resolve, reject) {
			exec('rm -rf ' + pPath,function(err,out) { 
				if (err) {
					reject(err);
				} else {
					resolve(out);
				}
				//console.log(out); err && console.log(err); 
			});
		});
	};

	var clearHpccClusterInit = function() {
		var oPromises = [];
		oPromises.push( function() { return Promise.resolve(); } );
		if (Fs.existsSync( WORK_DIR )) oPromises.push( function() { return rmdirR( WORK_DIR ); } );
		if (Fs.existsSync( CLUSTER_CONFIG_FILE )) oPromises.push( function() { return Fs.promises.unlink( CLUSTER_CONFIG_FILE ); } );
		if (Fs.existsSync( MY_CONFIG_FILE )) oPromises.push( function() { return Fs.promises.unlink( MY_CONFIG_FILE ); } );
		return Promises.seq( oPromises );
	}
	
	beforeEach(function(done) {
		clearHpccClusterInit().then( function() {
			done();
		}, function(error) {
			done(error);
		});
		//this.modStub = sinon.stub(HpccClusterClass.prototype, 'mod');
		//done();
	});
	
	afterEach(function(done) {
		//assert( this.modStub.called );
		//HpccClusterClass.prototype.mod.restore();
		clearHpccClusterInit().then( function() {
			done();
		}, function(error) {
			done(error);
		});
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
		var oInit = oTested.handle( {}, options );
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
    	oTested.handle( {}, options ).then( function() {
    		oTested.handle( {}, options ).then( function() {
    			done('Expecting rejection.');
    		}, function( err2 ) {
    			done();
    		})
    	}, function( err ) {
    		done(err);
    	});
	});
});
