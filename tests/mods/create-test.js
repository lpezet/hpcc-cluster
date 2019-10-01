const Fs = require('fs');
var exec = require('child_process').exec
const AWS = require('aws-sdk');
const { yamlParse } = require('yaml-cfn');
const path = require('path');

const SimpleLogger = require('../../lib/logger');
const Logger = new SimpleLogger();

const assert = require('chai').assert;
//const sinon = require('sinon');
//const TEST_DIR = process.cwd();
const os = require('os');


const load_test_config = function() {
	return yamlParse( Fs.readFileSync( TEST_CONFIG_FILE_PATH, {encoding: 'utf8'}) );
}

//if ( ! Fs.existsSync( TEST_DIR ) ) Fs.mkdirSync( TEST_DIR );
const TEST_CONFIG_FILE_PATH = path.resolve(__dirname, "test.cluster.config");
var TEST_CLUSTER_CONFIG = load_test_config();
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

/* 
 * ======================================================
 * Create
 * ======================================================
 */
describe('Create',function(){
	
	var rmdirR = function( pPath ) {
		return exec('rm -rf ' + pPath,function(err,out) { 
		  console.log(out); err && console.log(err); 
		});
	};

	var clearHpccClusterInit = function() {
		const oWorkDir = path.resolve(os.tmpdir(), ".hpcc-cluster");
		//const oClusterConfigFile = path.resolve(TEST_DIR, "cluster.config");
		//const oMyConfigFile = path.resolve(TEST_DIR, "my.config");
		
		if (Fs.existsSync( oWorkDir )) rmdirR( oWorkDir );
		//if (Fs.existsSync( oClusterConfigFile )) Fs.unlinkSync( oClusterConfigFile );
		//if (Fs.existsSync( oMyConfigFile )) Fs.unlinkSync( oMyConfigFile );

	}
	
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
	
	describe('handle_create_cloudformation_templates', function() {
		var HpccClusterMock = {
    			mod: function() {}
    	};
    	
    	var CloudClientMock = {};
    	
    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
    	oTested.mCreateSpot.handle_create_cloudformation_templates = function() {
    		return Promise.resolve();
    	};
    	oTested.mCreateOnDemand.handle_create_cloudformation_templates = function() {
    		return Promise.resolve();
    	};
    	
		it('on-demand', function(done) {
	    	var oActual = oTested.handle_create_cloudformation_templates( { Email: 'toto@titi.com', Cluster: { Name: "talentedmint", Type: 'on-demand' }, AWS: { S3Bucket: "testbucket", Username: "testuser" }, Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done();
			}, function( pError ) {
				done( pError );
			});
		});
		
		it('default cluster type', function(done) {
	    	var oActual = oTested.handle_create_cloudformation_templates( { Email: 'toto@titi.com', Cluster: { Name: "talentedmint" }, AWS: { S3Bucket: "testbucket", Username: "testuser" }, Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done();
			}, function( pError ) {
				done( pError );
			});
		});
		
		it('spot', function(done) {
	    	var oActual = oTested.handle_create_cloudformation_templates( { Email: 'toto@titi.com', Cluster: { Name: "talentedmint", Type: 'spot' }, AWS: { S3Bucket: "testbucket", Username: "testuser" }, Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done();
			}, function( pError ) {
				done( pError );
			});
		});
		
		it('invalid', function(done) {
			var oActual = oTested.handle_create_cloudformation_templates( { AWS: { S3Bucket: "testbucket", Username: "testuser" }, Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done('Expected error.');
			}, function( pError ) {
				done();
			});
		});
	});
	
	describe('handle_create', function() {
		var HpccClusterMock = {
    			mod: function() {}
    	};
    	
    	var CloudClientMock = {
    			estimate_template_cost: function() {
    				return Promise.resolve();
    			},
    			s3_upload_file: function() {
    				return Promise.resolve("TODO: dunno what's returned here.");
    			}
    	};
    	
    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
    	oTested.mCreateSpot.handle_create = function() {
    		return Promise.resolve();
    	};
    	oTested.mCreateOnDemand.handle_create = function() {
    		return Promise.resolve();
    	};
    	
		it('on-demand', function(done) {
	    	var oActual = oTested.handle_create( { Email: 'toto@titi.com', Cluster: { Name: "talentedmint", Type: 'on-demand' }, AWS: { S3Bucket: "testbucket", Username: "testuser" }, Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done();
			}, function( pError ) {
				done( pError );
			});
		});
		
		it('default cluster type', function(done) {
	    	var oActual = oTested.handle_create( { Email: 'toto@titi.com', Cluster: { Name: "talentedmint" }, AWS: { S3Bucket: "testbucket", Username: "testuser" }, Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done();
			}, function( pError ) {
				done( pError );
			});
		});
		
		it('spot', function(done) {
	    	var oActual = oTested.handle_create( { Email: 'toto@titi.com', Cluster: { Name: "talentedmint", Type: 'spot' }, AWS: { S3Bucket: "testbucket", Username: "testuser" }, Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done();
			}, function( pError ) {
				done( pError );
			});
		});
		
		it('invalid', function(done) {
	    	try {
				oTested.handle_create( { Cluster: { Name: "talentedmint" }, AWS: { S3Bucket: "testbucket", Username: "testuser" }, Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
				done('Expected error.');
			} catch (e) {
				done();
			}
		});
	});
	
	describe('estimate', function() {
		it('on-demand', function(done) {
			var HpccClusterMock = {
	    			mod: function() {}
	    	};
	    	
	    	var CloudClientMock = {
	    			estimate_template_cost: function() {
	    				return Promise.resolve();
	    			},
	    			s3_upload_file: function() {
	    				return Promise.resolve("TODO: dunno what's returned here.");
	    			}
	    	};
	    	
	    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
	    	oTested.create_cloudformation_templates = function() {
	    		return Promise.resolve();
	    	}
	    	var oActual = oTested.handle_estimate( { Cluster: { Name: "talentedmint", Type: 'on-demand' }, AWS: { S3Bucket: "testbucket", Username: "testuser" }, Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done();
			}, function( pError ) {
				done( pError );
			});
		});
		it('spot', function(done) {
			var HpccClusterMock = {
	    			mod: function() {}
	    	};
	    	
	    	var CloudClientMock = {
	    			estimate_template_cost: function() {
	    				return Promise.resolve();
	    			},
	    			s3_upload_file: function() {
	    				return Promise.resolve("TODO: dunno what's returned here.");
	    			}
	    	};
	    	
	    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
	    	oTested.create_cloudformation_templates = function() {
	    		return Promise.resolve();
	    	}
	    	var oActual = oTested.handle_estimate( { Cluster: { Name: "talentedmint", Type: "spot" }, AWS: { S3Bucket: "testbucket", Username: "testuser" }, Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done();
			}, function( pError ) {
				done( pError );
			});
		});
		it('error estimate_template_cost', function(done) {
			var HpccClusterMock = {
	    			mod: function() {}
	    	};
	    	
	    	var CloudClientMock = {
	    			estimate_template_cost: function() {
	    				return Promise.reject(new Error('test error'));
	    			},
	    			s3_upload_file: function() {
	    				return Promise.resolve("TODO: dunno what's returned here.");
	    			}
	    	};
	    	
	    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
	    	oTested.create_cloudformation_templates = function() {
	    		return Promise.resolve();
	    	}
	    	var oActual = oTested.handle_estimate( { Cluster: { Name: "talentedmint" }, AWS: { S3Bucket: "testbucket", Username: "testuser" }, Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done('Expecting error.');
			}, function( pError ) {
				done();
			});
		});
		
		it('error create cloudformation templates', function(done) {
			var HpccClusterMock = {
	    			mod: function() {}
	    	};
	    	
	    	var CloudClientMock = {
	    			estimate_template_cost: function() {
	    				return Promise.resolve();
	    			}
	    	};
	    	
	    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
	    	oTested.create_cloudformation_templates = function() {
	    		return Promise.reject();
	    	}
	    	var oActual = oTested.handle_estimate( { Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done( 'Expected rejection.');
			}, function( pError ) {
				done();
			});
		});
		it('error cloud client', function(done) {
			var HpccClusterMock = {
	    			mod: function() {}
	    	};
	    	
	    	var CloudClientMock = {
	    			estimate_template_cost: function() {
	    				return Promise.reject();
	    			}
	    	};
	    	
	    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
	    	oTested.create_cloudformation_templates = function() {
	    		return Promise.resolve();
	    	}
	    	var oActual = oTested.handle_estimate( { Vpc: { SubnetId: "", SecurityGroupId: "" } }, {} );
			oActual.then( function() {
				done( 'Expected rejection.');
			}, function( pError ) {
				done();
			});
		});
	});
	
	
	it('secure storage reject',function(done){
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
    				return Promise.reject( new Error("Test error") );
    			},
    			create_stack_to_completion: function() {
    				return Promise.resolve("TODO: dunno what's returned here.");
    			}
    	};
    	
    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
    	var options = { parent: {} };
		var oActual = oTested.handle_create( TEST_CLUSTER_CONFIG, options );
		oActual.then( function() {
			done( 'Expecting rejection.' );
		}, function( pError ) {
			done();
		});
	});
	
	it('should not upload during dry run', function(done) {
		var HpccClusterMock = {
    			mod: function() {},
    			save_state: function() {
    				return Promise.resolve();
    			},
    			refresh_state: function() {
    				return Promise.resolve();
    			}
    	}
    	var oS3UploadCalled = false;
		var oSecureStorageCalled = false;
		
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
    				oS3UploadCalled = true;
    				return Promise.resolve("TODO: dunno what's returned here.");
    			},
    			secure_storage_setup: function() {
    				oSecureStorageCalled = true;
    				return Promise.resolve("TODO: dunno what's returned here.");
    			},
    			create_stack_to_completion: function() {
    				return Promise.resolve("TODO: dunno what's returned here.");
    			}
    	};
    	
    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
    	
    	var options = { parent: {} };
    	const oConfig = load_test_config();
    	oConfig['DryRun'] = true;
		var oActual = oTested.handle_create( oConfig, options );
		oActual.then( function() {
			try {
				assert.isFalse( oS3UploadCalled );
				assert.isFalse( oSecureStorageCalled );
				done();
			} catch(e) {
				done(e);
			}
		}, function( pError ) {
			console.error('Failed!');
			if ( pError ) console.error( pError );
			done( pError );
		});
	});
	
	it('create on-demand',function(done){
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
    	
    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
    	
		var options = { parent: {} };
    	var oActual = oTested.handle_create( TEST_CLUSTER_CONFIG, options );
		oActual.then( function() {
			done();
		}, function( pError ) {
			console.error('Failed!');
			if ( pError ) console.error( pError );
			done( pError );
		});
	});
	
	it('create spot',function(done){
		var HpccClusterMock = {
    			mod: function() {},
    			save_state: function() {
    				return Promise.resolve();
    			},
    			refresh_state: function() {
    				return Promise.resolve();
    			}
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
    	
    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
    	
		var options = { parent: {} };
		var config = JSON.parse(JSON.stringify( TEST_CLUSTER_CONFIG ));
		config['Cluster']['Type'] = 'spot';
    	var oActual = oTested.handle_create( config, options );
		oActual.then( function() {
			done();
		}, function( pError ) {
			console.error('Failed!');
			if ( pError ) console.error( pError );
			done( pError );
		});
	});
	
	it('create invalid config',function(done){
		var HpccClusterMock = {
    			mod: function() {},
    			save_state: function() {
    				return Promise.resolve();
    			},
    			refresh_state: function() {
    				return Promise.resolve();
    			}
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
    	
    	var oTested = new TestedClass( HpccClusterMock, Logger, Utils, CloudClientMock );
    	
		var options = { parent: {} };
		var config = JSON.parse(JSON.stringify( TEST_CLUSTER_CONFIG ));
		delete config['Cluster'];
    	var oActual = oTested.handle_create( config, options );
		oActual.then( function() {
			done('Expected error');
		}, function( pError ) {
			done();
		});
	});
});
