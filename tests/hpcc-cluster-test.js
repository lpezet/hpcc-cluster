const path = require('path');

const SimpleLogger = require('../lib/logger');
const Logger = new SimpleLogger();

const HandlerClass = require('../lib/handler');
var HPCCClusterClass = require('../lib/hpcc-cluster');
const assert = require('chai').assert;

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
	
	it('extend', function() {
		var oHPCCCluster = new HPCCClusterClass( Logger, DEFAULT_ERROR_HANDLER, Utils );
		var oExtension = {
				b: function() {
					return "b";
				},
				c: function() {
					return "c";
				}
		};
		oHPCCCluster.extend( oExtension, 'b');
		assert.exists( oHPCCCluster.b );
	});
	
	it('resolve path', function() {
		var oHPCCCluster = new HPCCClusterClass( Logger, DEFAULT_ERROR_HANDLER, Utils );
		var oActual = oHPCCCluster.resolve_path( 'toto.txt');
		assert.equal( oActual, path.resolve( process.cwd(), 'toto.txt') );
	});
	
	it('handle error', function() {
		var oCalled = false;
		var ErrorHandler = {
				doHandle: function() {
					oCalled = true;
				}
		};
		var oHPCCCluster = new HPCCClusterClass( Logger, ErrorHandler, Utils );
		oHPCCCluster.handle_error( new Error() );
		assert.isTrue( oCalled );
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
		oHPCCCluster.load_state().then(function( pJSON ) {
			done();
		}, function( pError ) {
			done( pError );
		});
	});
	
	it('get_state', function(done) {
		var oHPCCCluster = new HPCCClusterClass( Logger, DEFAULT_ERROR_HANDLER, Utils );
		oHPCCCluster.get_state().then(function( pData ) {
			done();
		}, function( pError ) {
			done( pError );
		});
	});
	
	describe('refresh_state', function() {
		it('no_status_mod', function() {
			var oHPCCCluster = new HPCCClusterClass( Logger, DEFAULT_ERROR_HANDLER, Utils );
			oHPCCCluster.refresh_state().then(function() {
				done('Expected error.');
			}, function( pError ) {
				done();
			})
		});
		it('status_mod', function() {
			var oHPCCCluster = new HPCCClusterClass( Logger, DEFAULT_ERROR_HANDLER, Utils );
			oHPCCCluster['status'] = function() {
				return Promise.resolve( {} );
			}
			oHPCCCluster.refresh_state().then(function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
	});
});
