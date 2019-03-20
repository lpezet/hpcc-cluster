const SimpleLogger = require('../lib/logger');
const Logger = new SimpleLogger();

const assert = require('chai').assert;


const TestedClass = require("../lib/cloud");

/* 
 * ======================================================
 * Cloud
 * ======================================================
 */
describe('Cloud',function(){
	
	before(function(done) {
		done();
	});
	
	after(function(done) {
		done();
	});
	
	describe('estimate_template_cost', function() {
		it('basic', function(done) {
			var oClientMock = {
					estimateTemplateCost: function( pParams, pCallback ) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.estimate_template_cost( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('client not provided', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.estimate_template_cost( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error estimateTemplateCost', function(done) {
			var oClientMock = {
					estimateTemplateCost: function( pParams, pCallback ) {
						pCallback( new Error(), null );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.estimate_template_cost( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
	
	describe('secure_storage_setup', function() {
		it('basic', function(done) {
			var oClientMock = {
					getParameter: function( pParams, pCallback ) {
						pCallback( null, { Parameter: {} } );
					},
					putParameter: function( pParams, pCallback ) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { ssm: oClientMock } );
			oTested.secure_storage_setup( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('parameter not found', function(done) {
			var oClientMock = {
					getParameter: function( pParams, pCallback ) {
						pCallback( { code: "ParameterNotFound" }, null );
					},
					putParameter: function( pParams, pCallback ) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { ssm: oClientMock } );
			oTested.secure_storage_setup( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('client not provided', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.secure_storage_setup( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error getParameter', function(done) {
			var oClientMock = {
					getParameter: function( pParams, pCallback ) {
						pCallback( new Error(), null );
					},
					putParameter: function( pParams, pCallback ) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { ssm: oClientMock } );
			oTested.secure_storage_setup( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error putParameter', function(done) {
			var oClientMock = {
					getParameter: function( pParams, pCallback ) {
						pCallback( null, {} );
					},
					putParameter: function( pParams, pCallback ) {
						pCallback( new Error(), null );
					}
			}
			var oTested = new TestedClass( Logger, { ssm: oClientMock } );
			oTested.secure_storage_setup( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
	
	describe('s3_upload_file', function() {
		it('basic', function(done) {
			var oClientMock = {
					upload: function( pParams, pCallback ) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { s3: oClientMock } );
			oTested.s3_upload_file( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('client not provided', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.s3_upload_file( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error upload', function(done) {
			var oClientMock = {
					upload: function( pParams, pCallback ) {
						pCallback( new Error(), null );
					}
			}
			var oTested = new TestedClass( Logger, { s3: oClientMock } );
			oTested.s3_upload_file( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
	
	describe('get_aws_user', function() {
		it('basic', function(done) {
			var oClientMock = {
					getUser: function( pParams, pCallback ) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { iam: oClientMock } );
			oTested.get_aws_user( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('client not provided', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.get_aws_user( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error upload', function(done) {
			var oClientMock = {
					getUser: function( pParams, pCallback ) {
						pCallback( new Error(), null );
					}
			}
			var oTested = new TestedClass( Logger, { iam: oClientMock } );
			oTested.get_aws_user( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
	
	describe('validate_template', function() {
		it('basic', function(done) {
			var oClientMock = {
					validateTemplate: function( pParams, pCallback ) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.validate_template( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('client not provided', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.validate_template( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error validateTemplate', function(done) {
			var oClientMock = {
					validateTemplate: function( pParams, pCallback ) {
						pCallback( new Error(), null );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.validate_template( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
	
	describe('create_stack', function() {
		it('basic', function(done) {
			var oClientMock = {
					createStack: function( pParams, pCallback ) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.create_stack( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('client not provided', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.create_stack( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error createStack', function(done) {
			var oClientMock = {
					createStack: function( pParams, pCallback ) {
						pCallback( new Error(), null );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.create_stack( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
	
	describe('stop_instances_to_completion', function() {
		it('basic', function(done) {
			var oClientMock = {
					stopInstances: function( pParams, pCallback ) {
						pCallback( null, {} );
					},
					waitFor: function( pState, pParams, pCallback ) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { ec2: oClientMock } );
			oTested.stop_instances_to_completion( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('client not provided', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.stop_instances_to_completion( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error stopInstances', function(done) {
			var oClientMock = {
					stopInstances: function( pParams, pCallback ) {
						pCallback( new Error(), {} );
					},
					waitFor: function( pParams, pCallback) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { ec2: oClientMock } );
			oTested.stop_instances_to_completion( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error waitFor', function(done) {
			var oClientMock = {
					stopInstances: function( pParams, pCallback ) {
						pCallback( null, {} );
					},
					waitFor: function( pParams, pCallback) {
						pCallback( new Error(), null );
					}
			}
			var oTested = new TestedClass( Logger, { ec2: oClientMock } );
			oTested.stop_instances_to_completion( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
	
	describe('start_instances_to_completion', function() {
		it('basic', function(done) {
			var oClientMock = {
					startInstances: function( pParams, pCallback ) {
						pCallback( null, {} );
					},
					waitFor: function( pState, pParams, pCallback ) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { ec2: oClientMock } );
			oTested.start_instances_to_completion( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('client not provided', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.start_instances_to_completion( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error startInstances', function(done) {
			var oClientMock = {
					startInstances: function( pParams, pCallback ) {
						pCallback( new Error(), {} );
					},
					waitFor: function( pParams, pCallback) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { ec2: oClientMock } );
			oTested.start_instances_to_completion( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error waitFor', function(done) {
			var oClientMock = {
					startInstances: function( pParams, pCallback ) {
						pCallback( null, {} );
					},
					waitFor: function( pParams, pCallback) {
						pCallback( new Error(), null );
					}
			}
			var oTested = new TestedClass( Logger, { ec2: oClientMock } );
			oTested.start_instances_to_completion( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
	
	//
	describe('create_stack_to_completion', function() {
		it('basic', function(done) {
			var oClientMock = {
					createStack: function( pParams, pCallback ) {
						pCallback( null, {} );
					},
					waitFor: function( pState, pParams, pCallback ) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.stack_exists = function() {
				return Promise.reject();
			};
			oTested.create_stack_to_completion( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('stack already exists', function(done) {
			var oClientMock = {
					createStack: function( pParams, pCallback ) {
						pCallback( null, {} );
					},
					waitFor: function( pState, pParams, pCallback ) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.stack_exists = function() {
				return Promise.resolve();
			};
			oTested.create_stack_to_completion( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client not provided', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.create_stack_to_completion( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error createStack', function(done) {
			var oClientMock = {
					createStack: function( pParams, pCallback ) {
						pCallback( new Error(), null );
					},
					waitFor: function( pParams, pCallback) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.create_stack_to_completion( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error waitFor', function(done) {
			var oClientMock = {
					createStack: function( pParams, pCallback ) {
						pCallback( null, {} );
					},
					waitFor: function( pParams, pCallback) {
						pCallback( new Error(), null );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.create_stack_to_completion( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
	
	describe('describe_instances', function() {
		it('basic', function(done) {
			var oClientMock = {
					describeInstances: function( pParams, pCallback ) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { ec2: oClientMock } );
			oTested.describe_instances( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('client not provided', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.describe_instances( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error describeInstances', function(done) {
			var oClientMock = {
					describeInstances: function( pParams, pCallback ) {
						pCallback( new Error(), null );
					}
			}
			var oTested = new TestedClass( Logger, { ec2: oClientMock } );
			oTested.describe_instances( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
	
	describe('stack_exists', function() {
		it('basic', function(done) {
			var oClientMock = {
					describeStacks: function( pParams, pCallback ) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.stack_exists( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('stack does not exist', function(done) {
			var oClientMock = {
					describeStacks: function( pParams, pCallback ) {
						pCallback( { code: "ValidationError" } , null );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.stack_exists( {} ).then( function() {
				done( 'Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client not provided', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.stack_exists( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error describeStacks', function(done) {
			var oClientMock = {
					describeStacks: function( pParams, pCallback ) {
						pCallback( new Error(), null );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.stack_exists( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
	
	describe('get_sub_stacks', function() {
		it('basic', function(done) {
			var oClientMock = {
					listStackResources: function( pParams, pCallback ) {
						pCallback( null, { StackResourceSummaries: [] } );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.get_sub_stacks( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('client not provided', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.get_sub_stacks( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error describeStacks', function(done) {
			var oClientMock = {
					listStackResources: function( pParams, pCallback ) {
						pCallback( new Error(), null );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.get_sub_stacks( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
	
	describe('get_all_ec2_instance_ids_from_cluster', function() {
		it('basic', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.get_sub_stacks = function() {
				return Promise.resolve([ { ResourceType: "AWS::CloudFormation::Stack", PhysicalResourceId: "Stack123" } ] );
			}
			oTested.get_all_ec2_instance_ids_from_stacks = function() {
				return Promise.resolve();
			}
			oTested.get_all_ec2_instance_ids_from_cluster( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('client error get_sub_stacks', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.get_sub_stacks = function() {
				return Promise.reject();
			}
			oTested.get_all_ec2_instance_ids_from_cluster( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error get_all_ec2_instance_ids_from_stacks', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.get_sub_stacks = function() {
				return Promise.resolve([ { ResourceType: "AWS::CloudFormation::Stack", PhysicalResourceId: "Stack123" } ] );
			}
			oTested.get_all_ec2_instance_ids_from_stacks = function() {
				return Promise.reject();
			}
			oTested.get_all_ec2_instance_ids_from_cluster( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
	
	describe('get_sub_stacks', function() {
		it('basic', function(done) {
			var oClientMock = {
					listStackResources: function( pParams, pCallback ) {
						pCallback( null, { StackResourceSummaries: [ { ResourceType: "AWS::CloudFormation::Stack", PhysicalResourceId: "Stack123" } ] } );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.get_sub_stacks( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('client not provided', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.get_sub_stacks( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error listStackResources', function(done) {
			var oClientMock = {
					listStackResources: function( pParams, pCallback ) {
						pCallback( new Error(), null );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.get_sub_stacks( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
	
	describe('get_all_ec2_instance_ids_from_stack', function() {
		it('basic', function(done) {
			var oClientMock = {
					listStackResources: function( pParams, pCallback ) {
						pCallback( null, { StackResourceSummaries: [ { ResourceType: "AWS::EC2::Instance", PhysicalResourceId: "Instance123" } ] } );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.get_all_ec2_instance_ids_from_stack( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('client not provided', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.get_all_ec2_instance_ids_from_stack( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error listStackResources', function(done) {
			var oClientMock = {
					listStackResources: function( pParams, pCallback ) {
						pCallback( new Error(), null );
					}
			}
			var oTested = new TestedClass( Logger, { cf: oClientMock } );
			oTested.get_all_ec2_instance_ids_from_stack( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
	
	//get_all_ec2_instance_ids_from_stacks
	
	describe('find_PublicIp', function() {
		it('present', function() {
			var oTested = new TestedClass( Logger, {} );
			var oInstanceStatus = {
					NetworkInterfaces: [
						{ 
							Association: {
								PublicIp: "1.1.1.1"
							}
						}
					]
			};
			assert.equal( oTested.find_PublicIp( oInstanceStatus ), "1.1.1.1");
		});
		it('missing', function() {
			var oTested = new TestedClass( Logger, {} );
			assert.isNull( oTested.find_PublicIp( null ) );
			assert.isNull( oTested.find_PublicIp( {} ) );
			assert.isNull( oTested.find_PublicIp( { NetworkInterfaces: [] } ) );
			assert.isNull( oTested.find_PublicIp( { NetworkInterfaces: [ { Association: { PrivateIp: "1.2.3.4" } } ] } ) );
		});
	});
	
	describe('find_PrivateIpAddress', function() {
		it('present', function() {
			var oTested = new TestedClass( Logger, {} );
			var oInstanceStatus = {
					NetworkInterfaces: [
						{ 
							PrivateIpAddress: "1.1.1.1"
						}
					]
			};
			assert.equal( oTested.find_PrivateIpAddress( oInstanceStatus ), "1.1.1.1");
		});
		it('missing', function() {
			var oTested = new TestedClass( Logger, {} );
			assert.isNull( oTested.find_PrivateIpAddress( null ) );
			assert.isNull( oTested.find_PrivateIpAddress( {} ) );
			assert.isNull( oTested.find_PrivateIpAddress( { NetworkInterfaces: [] } ) );
			assert.isNull( oTested.find_PrivateIpAddress( { NetworkInterfaces: [ { Association: { PublicIp: "1.2.3.4" } } ] } ) );
		});
	});
	
	//
	describe('describe_ec2_status', function() {
		it('basic', function(done) {
			var oClientMock = {
					describeInstances: function( pParams, pCallback ) {
						pCallback( null, { Reservations: { "Instance123": { Instances: [ { Tags: [ { Key: "Fake", Value: "MoreFake" },  { Key: "Name", Value: "Master" } ] } ] } } }  );
					},
					describeInstanceStatus: function( pParams, pCallback ) {
						pCallback( null, { InstanceStatuses: [ { InstanceId: "Instance123", SystemStatus: { Status: "Sleeping" }, InstanceStatus: { Status: "LikeALog" }, InstanceState: { Name: "Sleeper" } } ] } );
					}
			}
			var oTested = new TestedClass( Logger, { ec2: oClientMock } );
			oTested.describe_ec2_status( {} ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			})
		});
		it('client not provided', function(done) {
			var oTested = new TestedClass( Logger, {} );
			oTested.describe_ec2_status( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error describeInstances', function(done) {
			var oClientMock = {
					describeInstances: function( pParams, pCallback ) {
						pCallback( new Error() );
					},
					describeInstanceStatus: function( pParams, pCallback ) {
						pCallback( null, {} );
					}
			}
			var oTested = new TestedClass( Logger, { ec2: oClientMock } );
			oTested.describe_ec2_status( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
		it('client error describeInstanceStatus', function(done) {
			var oClientMock = {
					describeInstances: function( pParams, pCallback ) {
						pCallback( null, { Reservations: [ { Instances: [ { Tags: [ { Key: "Name", Value: "Master" } ] } ] } ] } );
					},
					describeInstanceStatus: function( pParams, pCallback ) {
						pCallback( new Error(), null );
					}
			}
			var oTested = new TestedClass( Logger, { ec2: oClientMock } );
			oTested.describe_ec2_status( {} ).then( function() {
				done('Expected rejection.');
			}, function( pError ) {
				done();
			})
		});
	});
});
