const Fs = require('fs');
var exec = require('child_process').exec
const AWS = require('aws-sdk');
const { yamlParse } = require('yaml-cfn');
const path = require('path');

const SimpleLogger = require('../../lib/logger');
const Logger = new SimpleLogger();

//const assert = require('assert');
//const sinon = require('sinon');
//const TEST_DIR = process.cwd();
const os = require('os');


//if ( ! Fs.existsSync( TEST_DIR ) ) Fs.mkdirSync( TEST_DIR );
const TEST_CONFIG_FILE_PATH = path.resolve(__dirname, "test.cluster.config");
var oClusterConfig = yamlParse( Fs.readFileSync( TEST_CONFIG_FILE_PATH, {encoding: 'utf8'}) );
/*
const HandlerClass = require('../../lib/handler');
class DefaultErrorHandler extends HandlerClass {
    doHandle( pError, pReject, pHandlerChain ) {
         //console.log('DefaultErrorHandler!!!');
            //winston.log('error', pError);
    	console.log( pError );
        if ( pReject ) pReject( pError );
            // Assumption is this is the last error handler.
    }
}

const DEFAULT_ERROR_HANDLER = new DefaultErrorHandler();
*/

const TestedClass = require("../../lib/mods/create");
//const HpccClusterClass = require("../../lib/hpcc-cluster");
const UtilsClass = new require('../../lib/utils');
//const Utils = new UtilsClass( DEFAULT_ERROR_HANDLER );
const Utils = new UtilsClass();


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
	const oWorkDir = path.resolve(os.tmpdir(), ".hpcc-cluster");
	//const oClusterConfigFile = path.resolve(TEST_DIR, "cluster.config");
	//const oMyConfigFile = path.resolve(TEST_DIR, "my.config");
	
	if (Fs.existsSync( oWorkDir )) rmdirR( oWorkDir );
	//if (Fs.existsSync( oClusterConfigFile )) Fs.unlinkSync( oClusterConfigFile );
	//if (Fs.existsSync( oMyConfigFile )) Fs.unlinkSync( oMyConfigFile );

}

/* 
 * ======================================================
 * Create
 * ======================================================
 */
describe('Create',function(){
	
	before(function(done) {
		clearHpccClusterInit();
		//this.modStub = sinon.stub(HpccClusterClass.prototype, 'mod');
		done();
	});
	
	after(function(done) {
		//assert( this.modStub.called );
		//HpccClusterClass.prototype.mod.restore();
		clearHpccClusterInit();
		done();
	});

	it('should create',function(done){
		/*
    	var oDescribeStacksCount = 0;
    	var describeStacksStub = sinon.stub(CF, 'describeStacks'); //.return( )
    	describeStacksStub.callsFake( function( pParams, pCallback ) {
    		//console.log('calling CF.describeStacks...');
    		if ( oDescribeStacksCount === 0 ) pCallback( { code: 'ValidationError' } );
    		else pCallback( null, {} ); // when refreshing state and querying CF
    		oDescribeStacksCount++;
    	});
    	
    	// For Status
    	var listStackResourcesStub = sinon.stub(CF, 'listStackResources'); //.return( )
    	listStackResourcesStub.callsFake( function( pParams, pCallback ) {
    		//console.log('calling listStackResources...');
    		pCallback( null, { StackResourceSummaries: [ { ResourceType: 'AWS::EC2::Instance', PhysicalResourceId: 'i-test-01' } ] } );
    	});
    	var describeInstancesStub = sinon.stub(EC2, 'describeInstances');//.return( {} );
		describeInstancesStub.callsFake( function( pParams, pCallback ) {
			//console.log('calling describeInstances...');
			pCallback( null, { Reservations: [ { Instances: [ { InstanceId: 'i-test-01', Tags: [ { Key: 'Name', Value: 'this-is-a-test-node' }] } ] } ] } );
		});
		var describeInstanceStatusStub = sinon.stub(EC2, 'describeInstanceStatus');
		describeInstanceStatusStub.callsFake( function( pParams, pCallback ) {
			//console.log('calling describeInstances...');
			pCallback( null, { InstanceStatuses: [ { InstanceId: 'i-test-01', SystemStatus: { Status: 'barelyrunning' }, InstanceStatus: { Status: 'barelyrunning' }, InstanceState: { Name: 'barelyrunning' } } ] } );
		});
    	// End Of Status
    	
    	var validateTemplateStub = sinon.stub(CF, 'validateTemplate'); //.return( )
    	validateTemplateStub.callsFake( function( pParams, pCallback ) {
    		//console.log('calling CF.validateTemplate...');
    		pCallback( null, {} );
    	});
    	
    	var putObjectStub = sinon.stub(S3, 'putObject'); //.return( )
    	putObjectStub.callsFake( function( pParams, pCallback ) {
    		//console.log('calling S3.putObject...');
    		pCallback( null, {} );
    	});
    	
    	var uploadStub = sinon.stub(S3, 'upload'); //.return( )
    	uploadStub.callsFake( function( pParams, pCallback ) {
    		//console.log('calling S3.upload...');
    		pCallback( null, {} );
    	});
    	
    	var createStackStub = sinon.stub(CF, 'createStack'); //.return( )
    	createStackStub.callsFake( function( pParams, pCallback ) {
    		//console.log('calling CF.createStack...');
    		pCallback( null, { StackId: 'stack-test-01' } );
    	});
    	
    	var waitForStub = sinon.stub(CF, 'waitFor'); //.return( )
    	waitForStub.callsFake( function( pState, pParams, pCallback ) {
    		//console.log('calling CF.waitFor...');
    		pCallback( null, {} );
    	});
    	
    	var getParameterStub = sinon.stub(SSM, 'getParameter');
    	getParameterStub.callsFake( function( pParams, pCallback ) {
    		//console.log('calling describeStacks...');
    		pCallback( null, { 'Parameter': 'fake' } );
    	});
    	*/
		var HpccClusterMock = {
    			mod: function() {},
    			save_state: function() {
    				return Promise.resolve();
    			},
    			refresh_state: function() {
    				return Promise.resolve();
    			}
    			//mInternalConfig: {
    			//	LocalDir : path.resolve(os.tmpdir(), ".hpcc-cluster")
    			//}
    	}
    	
    	var CloudClientMock = {
    			stack_exists: function() {
    				return Promise.resolve();
    			},
    			get_all_ec2_instance_ids_from_cluster: function() {
    				return Promise.resolve( ['abc', 'def' ]);
    			},
    			describe_ec2_status: function( pEC2Client, pInstanceIds, pOutputToConsole ) {
    				return Promise.resolve('TODO: dunno what data looks like.');
    			},
    			s3_upload_file: function() {
    				return Promise.resolve("TODO: dunno what's returned here.");
    			},
    			secure_storage_setup: function() {
    				return Promise.resolve("TODO: dunno what's returned here.");
    			},
    			create_stack_to_completion: function() {
    				return Promise.resolve("TODO: dunno what's returned here.");
    			}
    	};
    	
    	//var HpccCluster = new HpccClusterClass(DEFAULT_ERROR_HANDLER, Utils);
		var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
    	
		//Fs.mkdirSync( HpccCluster.mInternalConfig.LocalDir );
	
    	var options = { parent: {} };
    	//var oInit = oHPCCCluster.init( options );
    	//oInit.then( function() {
    		var oActual = oTested.create( oClusterConfig, options );
			oActual.then( function() {
				done();
			}, function( pError ) {
				console.error('Failed!');
				if ( pError ) console.error( pError );
				done( pError );
			});
    	//}, function( pError ) {
		//	console.error('Failed!');
		//	if ( pError ) console.error( pError );
		//});
	
    	
    	
	});
});
