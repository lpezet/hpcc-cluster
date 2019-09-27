const Fs = require('fs');
var exec = require('child_process').exec
const AWS = require('aws-sdk');
//const { yamlParse } = require('yaml-cfn');
const path = require('path');
const SimpleLogger = require('../../lib/logger');
const Logger = new SimpleLogger();
const os = require('os');

/*
const load_test_config = function() {
	return yamlParse( Fs.readFileSync( TEST_CONFIG_FILE_PATH, {encoding: 'utf8'}) );
}
const TEST_CONFIG_FILE_PATH = path.resolve(__dirname, "test.cluster.config");
var TEST_CLUSTER_CONFIG = load_test_config();
*/

const TestedClass = require("../../lib/mods/validate");
const UtilsClass = new require('../../lib/utils');
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

/* 
 * ======================================================
 * Create
 * ======================================================
 */
describe('Validate',function() {
	var rmdirR = function( pPath ) {
		return exec('rm -rf ' + pPath,function(err,out) { 
		  console.log(out); err && console.log(err); 
		});
	};

	var clearHpccClusterInit = function() {
		const oWorkDir = path.resolve(os.tmpdir(), ".hpcc-cluster");
		if (Fs.existsSync( oWorkDir )) rmdirR( oWorkDir );
	}
	
	before(function(done) {
		clearHpccClusterInit();
		done();
	});
	
	after(function(done) {
		clearHpccClusterInit();
		done();
	});
	
	describe('handle', function() {
		it('basic', function(done) {
			var HpccClusterMock = {
	    			mod: function() {},
	    			create_cloudformation_templates: function() { return Promise.resolve({}); }
	    	};
	    	
	    	var CloudClientMock = {
	    			validate_template: function() {
	    				return Promise.resolve("TODO: dunno what's returned here.");
	    			}
	    	};
	    	
	    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
	    	var oActual = oTested.handle( { Cluster: { Name: "talentedmint" }, AWS: { S3Bucket: "testbucket", Username: "testuser" }, Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done();
			}, function( pError ) {
				done( pError );
			});
		});
		it('error create_cloudformation_templates missing', function(done) {
			var HpccClusterMock = {
	    			mod: function() {}
	    	};
	    	
	    	var CloudClientMock = {
	    			validate_template: function() {
	    				return Promise.resolve("TODO: dunno what's returned here.");
	    			}
	    	};
	    	
	    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
	    	var oActual = oTested.handle( { Cluster: { Name: "talentedmint" }, AWS: { S3Bucket: "testbucket", Username: "testuser" }, Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done('Expecting error.');
			}, function( pError ) {
				done();
			});
		});
		
		it('error validate_template', function(done) {
			var HpccClusterMock = {
	    			mod: function() {},
	    			create_cloudformation_templates: function() { return Promise.resolve({}); }
	    	};
	    	
	    	var CloudClientMock = {
	    			validate_template: function() {
	    				return Promise.reject(new Error('test error'));
	    			}
	    	};
	    	
	    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
	    	var oActual = oTested.handle( { Cluster: { Name: "talentedmint" }, AWS: { S3Bucket: "testbucket", Username: "testuser" }, Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done('Expecting error.');
			}, function( pError ) {
				done();
			});
		});
		
		it('error cloud client', function(done) {
			var HpccClusterMock = {
	    			mod: function() {},
	    			create_cloudformation_templates: function() { return Promise.resolve({}); }
	    	};
	    	
	    	var CloudClientMock = {
	    	};
	    	
	    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
	    	var oActual = oTested.handle( { Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done( 'Expected rejection.');
			}, function( pError ) {
				done();
			});
		});
	});
});
