//const Fs = require('fs');
//var exec = require('child_process').exec
//const AWS = require('aws-sdk');

const SimpleLogger = require('../lib/logger');
const Logger = new SimpleLogger();

const HandlerClass = require('../lib/handler');
//const { yamlParse } = require('yaml-cfn');
//const path = require('path');
//const winston = require('winston');
//const when = require("promised-io/promise").when;
var HPCCClusterClass = require('../lib/hpcc-cluster');
const assert = require('chai').assert;
//const sinon = require('sinon');
//const TEST_DIR = process.cwd();
//if ( ! Fs.existsSync( TEST_DIR ) ) Fs.mkdirSync( TEST_DIR );
//const TEST_CONFIG_FILE_PATH = path.resolve(__dirname, "test.cluster.config");
//var oClusterConfig = yamlParse( Fs.readFileSync( TEST_CONFIG_FILE_PATH, {encoding: 'utf8'}) );

class DefaultErrorHandler extends HandlerClass {
        doHandle( pError, pPromise, pHandlerChain ) {
                //console.log('DefaultErrorHandler!!!');
        	Logger.error( pError );
                if ( pPromise ) pPromise.reject( pError );
                // Assumption is this is the last error handler.
        }
}

const DEFAULT_ERROR_HANDLER = new DefaultErrorHandler();

const UtilsClass = new require('../lib/utils');
const Utils = new UtilsClass( DEFAULT_ERROR_HANDLER );

/* 
 * ======================================================
 * Init
 * ======================================================
 */
describe('HpccCluster',function(){
	
	before(function(done){
		done();
	});
	
	after(function(done) {
		done();
	});

	it('mod',function(){
		var oHPCCCluster = new HPCCClusterClass( Logger, DEFAULT_ERROR_HANDLER, Utils );
		var ModClass = function( pRoot ) {
			pRoot.mod( 'myMod', this, this.hello);
			this.mHelloCalled = false;
		}
		ModClass.prototype.helloCalled = function() {
			return this.mHelloCalled;
		}
		ModClass.prototype.hello = function() {
			this.mHelloCalled = true;
		}
    	var oMod = new ModClass( oHPCCCluster );
    	assert.exists( oHPCCCluster['myMod'] );
    	oHPCCCluster.myMod();
    	assert.isTrue( oMod.helloCalled() );
	});
	
	it('save_state', function(done) {
		var oHPCCCluster = new HPCCClusterClass( Logger, DEFAULT_ERROR_HANDLER, Utils );
		var oState = [
				{
					"Name": "master",
					"ImageId": "ami-97785bed"
				}
		];
		oHPCCCluster.save_state( {}, oState ).then(function() {
			done();
		}, function( pError ) {
			done( pError );
		})
	});
	
	it('load_state', function(done) {
		var oHPCCCluster = new HPCCClusterClass( Logger, DEFAULT_ERROR_HANDLER, Utils );
		var oState = {
				"master": { "ImageId": "ami-97785bed"}
		}
		oHPCCCluster.load_state( {}, oState ).then(function( pJSON ) {
			done();
		}, function( pError ) {
			done( pError );
		})
	});
});
