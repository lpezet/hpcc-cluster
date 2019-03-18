const Fs = require('fs');
//var exec = require('child_process').exec
const AWS = require('aws-sdk');

//const yaml = require('js-yaml');
const { yamlParse } = require('yaml-cfn');
const path = require('path');
//const util = require('util');

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
    doHandle( pError, pReject, pHandlerChain ) {
            //console.log('DefaultErrorHandler!!!');
           // winston.log('error', pError);
    	console.log( pError );
            if ( pReject ) pReject( pError );
            // Assumption is this is the last error handler.
    }
}

const DEFAULT_ERROR_HANDLER = new DefaultErrorHandler();
const HpccClusterClass = require("../../lib/hpcc-cluster");
const UtilsClass = new require('../../lib/utils');
const Utils = new UtilsClass( DEFAULT_ERROR_HANDLER );

*/
const TestedClass = require("../../lib/mods/halt");


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
 * Halt
 * ======================================================
 */
describe('Halt',function(){
	
	before(function(done){
		//this.modStub = sinon.stub(HpccClusterClass.prototype, 'mod');
		done();
	});
	
	after(function(done) {
		//assert( this.modStub.called );
		//HpccClusterClass.prototype.mod.restore();
		done();
	});

	it('should halt',function(done){
		/*
    	var CF = new AWS.CloudFormation();
    	//var S3 = new AWS.S3();
    	var EC2 = new AWS.EC2();
    	//var IAM = new AWS.IAM();
    	
    	var listStackResourcesStub = sinon.stub(CF, 'listStackResources'); //.return( )
    	listStackResourcesStub.callsFake( function( pParams, pCallback ) {
    		//console.log('calling listStackResources...');
    		pCallback( null, { StackResourceSummaries: [ 
    		   { ResourceType: 'AWS::EC2::Instance', PhysicalResourceId: 'i-test-01' }
            ] } );
    	});
    	
    	var stopInstancesStub = sinon.stub(EC2, 'stopInstances'); //.return( )
    	stopInstancesStub.callsFake( function( pParams, pCallback ) {
    		//console.log('calling listStackResources...');
    		pCallback( null, {} );
    	});
    	
    	var waitForStub = sinon.stub(EC2, 'waitFor'); //.return( )
    	waitForStub.callsFake( function( pStatus, pParams, pCallback ) {
    		//console.log('calling listStackResources...');
    		pCallback( null, {} );
    	});
    	
    	var HpccCluster = new HpccClusterClass(DEFAULT_ERROR_HANDLER, Utils);
    	*/
		var HpccClusterMock = {
    			mod: function() {},
    			save_state: function() {
    				return Promise.resolve();
    			}
    	}
    	
    	var UtilsMock = {
    	};
    	
    	var CloudClientMock = {
    			get_all_ec2_instance_ids_from_cluster: function() {
    				return Promise.resolve( ['abc', 'def' ]);
    			},
    			stop_instances_to_completion: function() {
    				return Promise.resolve( 'TODO: dunno what data looks like.' );
    			}
    	};
		var oTested = new TestedClass( HpccClusterMock, Logger, UtilsMock, CloudClientMock );
		
		
    	var options = { parent: {} };
    	var oActual = oTested.halt( oClusterConfig, options );
    	
    	oActual.then( function() {
    		done();
    	}, function( pError ) {
    		console.error('Failed!');
    		if ( pError ) console.error( pError );
    		done( pError );
    	});
    	
	});
});
