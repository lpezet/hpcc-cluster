const Fs = require('fs');
var exec = require('child_process').exec
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
const TEST_DIR = process.cwd();
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
const UtilsClass = new require('../../lib/utils');
const Utils = new UtilsClass( DEFAULT_ERROR_HANDLER );

*/
const TestedClass = require("../../lib/mods/run");


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
	  //console.log(out); err && console.log(err); 
	});
};

clearHpccClusterInit = function() {
	const oWorkDir = path.resolve(TEST_DIR, ".hpcc-cluster");
	const oClusterConfigFile = path.resolve(TEST_DIR, "cluster.config");
	const oMyConfigFile = path.resolve(TEST_DIR, "my.config");
	
	if (Fs.existsSync( oWorkDir )) rmdirR( oWorkDir );
	if (Fs.existsSync( oClusterConfigFile )) Fs.unlinkSync( oClusterConfigFile );
	if (Fs.existsSync( oMyConfigFile )) Fs.unlinkSync( oMyConfigFile );

}


/* 
 * ======================================================
 * Run
 * ======================================================
 */
describe('Run',function(){
	
	const INVALID_DESCRIBE_INSTANCES_RESPONSE = {
			"TotallyInvalid": {}
	};
	
	const DESCRIBE_INSTANCES_RESPONSE = {
		    "Reservations": [
		        {
		            "Groups": [],
		            "Instances": [
		                {
		                    "AmiLaunchIndex": 0,
		                    "ImageId": "ami-02e680c4540db351e",
		                    "InstanceId": "i-072e52e21a5e71171",
		                    "InstanceType": "m5.xlarge",
		                    "KeyName": "hpcc-cluster-us-east-2",
		                    "LaunchTime": "2019-03-16T03:14:25.000Z",
		                    "Monitoring": {
		                        "State": "disabled"
		                    },
		                    "Placement": {
		                        "AvailabilityZone": "us-east-2a",
		                        "GroupName": "",
		                        "Tenancy": "default"
		                    },
		                    "PrivateDnsName": "ip-172-31-14-180.us-east-2.compute.internal",
		                    "PrivateIpAddress": "172.31.14.180",
		                    "ProductCodes": [],
		                    "PublicDnsName": "ec2-18-222-163-81.us-east-2.compute.amazonaws.com",
		                    "PublicIpAddress": "18.222.163.81",
		                    "State": {
		                        "Code": 16,
		                        "Name": "running"
		                    },
		                    "StateTransitionReason": "",
		                    "SubnetId": "subnet-077c806e",
		                    "VpcId": "vpc-706e9a19",
		                    "Architecture": "x86_64",
		                    "BlockDeviceMappings": [
		                        {
		                            "DeviceName": "/dev/xvda",
		                            "Ebs": {
		                                "AttachTime": "2019-03-16T03:14:25.000Z",
		                                "DeleteOnTermination": true,
		                                "Status": "attached",
		                                "VolumeId": "vol-096e476889e877f71"
		                            }
		                        }
		                    ],
		                    "ClientToken": "ce6ad298-d55d-4a1c-83e5-ea12044e9fd2",
		                    "EbsOptimized": false,
		                    "EnaSupport": true,
		                    "Hypervisor": "xen",
		                    "InstanceLifecycle": "spot",
		                    "NetworkInterfaces": [
		                        {
		                            "Association": {
		                                "IpOwnerId": "amazon",
		                                "PublicDnsName": "ec2-18-222-163-81.us-east-2.compute.amazonaws.com",
		                                "PublicIp": "18.222.163.81"
		                            },
		                            "Attachment": {
		                                "AttachTime": "2019-03-16T03:14:25.000Z",
		                                "AttachmentId": "eni-attach-0013876cdaf67af92",
		                                "DeleteOnTermination": true,
		                                "DeviceIndex": 0,
		                                "Status": "attached"
		                            },
		                            "Description": "",
		                            "Groups": [
		                                {
		                                    "GroupName": "default",
		                                    "GroupId": "sg-67916f0e"
		                                }
		                            ],
		                            "Ipv6Addresses": [],
		                            "MacAddress": "02:f5:89:c3:8b:32",
		                            "NetworkInterfaceId": "eni-04a99bd85a21a4643",
		                            "OwnerId": "118717566870",
		                            "PrivateDnsName": "ip-172-31-14-180.us-east-2.compute.internal",
		                            "PrivateIpAddress": "172.31.14.180",
		                            "PrivateIpAddresses": [
		                                {
		                                    "Association": {
		                                        "IpOwnerId": "amazon",
		                                        "PublicDnsName": "ec2-18-222-163-81.us-east-2.compute.amazonaws.com",
		                                        "PublicIp": "18.222.163.81"
		                                    },
		                                    "Primary": true,
		                                    "PrivateDnsName": "ip-172-31-14-180.us-east-2.compute.internal",
		                                    "PrivateIpAddress": "172.31.14.180"
		                                }
		                            ],
		                            "SourceDestCheck": true,
		                            "Status": "in-use",
		                            "SubnetId": "subnet-077c806e",
		                            "VpcId": "vpc-706e9a19"
		                        }
		                    ],
		                    "RootDeviceName": "/dev/xvda",
		                    "RootDeviceType": "ebs",
		                    "SecurityGroups": [
		                        {
		                            "GroupName": "default",
		                            "GroupId": "sg-67916f0e"
		                        }
		                    ],
		                    "SourceDestCheck": true,
		                    "SpotInstanceRequestId": "sir-zrnrsveg",
		                    "Tags": [
		                        {
		                            "Key": "aws:ec2spot:fleet-request-id",
		                            "Value": "sfr-7a5680e9-9b3b-4812-bcaa-d4897b33a209"
		                        },
		                        {
		                        	"Key": "Name",
		                        	"Value": "this-is-a-test-node"
		                        }
		                    ],
		                    "VirtualizationType": "hvm",
		                    "CpuOptions": {
		                        "CoreCount": 2,
		                        "ThreadsPerCore": 2
		                    }
		                }
		            ],
		            "OwnerId": "118717566870",
		            "RequesterId": "323427466144",
		            "ReservationId": "r-076d97c76bf63cd0f"
		        }
		    ]
		};
	
	before(function(done){
		done();
	});
	
	after(function(done) {
		done();
	});
	
	it('exception in cloud get_all_ec2_instance_ids_from_cluster', function(done) {
		var HpccClusterMock = {
    			mod: function() {},
				refresh_state: function() {
    				return Promise.resolve();
    			}
    	}
    	
    	var UtilsMock = {
    	};
    	
    	var CloudClientMock = {
    			//describe_instances: function() {
    			//	return Promise.resolve( DESCRIBE_INSTANCES_RESPONSE );
    			//},
    			get_all_ec2_instance_ids_from_cluster: function() {
    				throw new Error('test error');
    			}
    	};
    	var SSHClientMock = {
    			exec: function() {
    				return Promise.resolve( 'TODO: dunno what data looks like.' );
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, UtilsMock, CloudClientMock, SSHClientMock );
		var options = { parent: {}, target: 'not-matching-any-target', cmd:'hostname' };
    	var oActual = oTested.handle( oClusterConfig, options );
    	
    	oActual.then( function() {
    		done('Expecting error.');
    	}, function( pError ) {
    		done();
    	});
	});
	
	it('error cloud get_all_ec2_instance_ids_from_cluster', function(done) {
		var HpccClusterMock = {
    			mod: function() {},
				refresh_state: function() {
    				return Promise.resolve();
    			}
    	}
    	
    	var UtilsMock = {
    	};
    	
    	var CloudClientMock = {
    			//describe_instances: function() {
    			//	return Promise.resolve( DESCRIBE_INSTANCES_RESPONSE );
    			//},
    			get_all_ec2_instance_ids_from_cluster: function() {
    				return Promise.reject( { error: {} } );
    			}
    	};
    	var SSHClientMock = {
    			exec: function() {
    				return Promise.resolve( 'TODO: dunno what data looks like.' );
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, UtilsMock, CloudClientMock, SSHClientMock );
		var options = { parent: {}, target: 'not-matching-any-target', cmd:'hostname' };
    	var oActual = oTested.handle( oClusterConfig, options );
    	
    	oActual.then( function() {
    		done('Expecting error.');
    	}, function( pError ) {
    		done();
    	});
	});
	
	it('unexpected cloud describe_instances response', function(done) {
		var HpccClusterMock = {
    			mod: function() {},
				refresh_state: function() {
    				return Promise.resolve();
    			}
    	}
    	
    	var UtilsMock = {
    	};
    	
    	var CloudClientMock = {
    			describe_instances: function() {
    				return Promise.resolve( INVALID_DESCRIBE_INSTANCES_RESPONSE );
    			},
    			get_all_ec2_instance_ids_from_cluster: function() {
    				return Promise.resolve( ['abc', 'def' ]);
    			}
    	};
    	var SSHClientMock = {
    			exec: function() {
    				return Promise.resolve( 'TODO: dunno what data looks like.' );
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, UtilsMock, CloudClientMock, SSHClientMock );
		var options = { parent: {}, target: 'not-matching-any-target', cmd:'hostname' };
    	var oActual = oTested.handle( oClusterConfig, options );
    	
    	oActual.then( function() {
    		done('Expecting error.');
    	}, function( pError ) {
    		done();
    	});
	});
	
	it('error cloud describe_instances', function(done) {
		var HpccClusterMock = {
    			mod: function() {},
				refresh_state: function() {
    				return Promise.resolve();
    			}
    	}
    	
    	var UtilsMock = {
    	};
    	
    	var CloudClientMock = {
    			describe_instances: function() {
    				return Promise.reject( { error: {} } );
    			},
    			get_all_ec2_instance_ids_from_cluster: function() {
    				return Promise.resolve( ['abc', 'def' ]);
    			}
    	};
    	var SSHClientMock = {
    			exec: function() {
    				return Promise.resolve( 'TODO: dunno what data looks like.' );
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, UtilsMock, CloudClientMock, SSHClientMock );
		var options = { parent: {}, target: 'not-matching-any-target', cmd:'hostname' };
    	var oActual = oTested.handle( oClusterConfig, options );
    	
    	oActual.then( function() {
    		done('Expecting error.');
    	}, function( pError ) {
    		done();
    	});
	})
	
	it('no matching target', function(done) {
		var HpccClusterMock = {
    			mod: function() {},
				refresh_state: function() {
    				return Promise.resolve();
    			}
    	}
    	
    	var UtilsMock = {
    	};
    	
    	var CloudClientMock = {
    			describe_instances: function() {
    				return Promise.resolve( DESCRIBE_INSTANCES_RESPONSE );
    			},
    			get_all_ec2_instance_ids_from_cluster: function() {
    				return Promise.resolve( ['abc', 'def' ]);
    			}
    	};
    	var SSHClientMock = {
    			exec: function() {
    				return Promise.resolve( 'TODO: dunno what data looks like.' );
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, UtilsMock, CloudClientMock, SSHClientMock );
		
    	
    	var options = { parent: {}, target: 'not-matching-any-target', cmd:'hostname' };
    	var oActual = oTested.handle( oClusterConfig, options );
    	
    	oActual.then( function() {
    		done();
    	}, function( pError ) {
    		done( pError );
    	});
	});
	
	it('no target error',function(done){
		var HpccClusterMock = {
    			mod: function() {},
				refresh_state: function() {
    				return Promise.resolve();
    			}
    	}
    	
    	var UtilsMock = {
    	};
    	
    	var CloudClientMock = {
    			describe_instances: function() {
    				return Promise.resolve( DESCRIBE_INSTANCES_RESPONSE );
    			},
    			get_all_ec2_instance_ids_from_cluster: function() {
    				return Promise.resolve( ['abc', 'def' ]);
    			}
    	};
    	var SSHClientMock = {
    			exec: function() {
    				throw new Error('fake error');
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, UtilsMock, CloudClientMock, SSHClientMock );
		
    	
    	try {
    		oTested.handle( oClusterConfig, { cmd: "whoami" } );
    		done( 'Expecting error' );
    	} catch( e ) {
    		done();
    	}
	});
	
	it('no command error',function(done){
		var HpccClusterMock = {
    			mod: function() {},
				refresh_state: function() {
    				return Promise.resolve();
    			}
    	}
    	
    	var UtilsMock = {
    	};
    	
    	var CloudClientMock = {
    			describe_instances: function() {
    				return Promise.resolve( DESCRIBE_INSTANCES_RESPONSE );
    			},
    			get_all_ec2_instance_ids_from_cluster: function() {
    				return Promise.resolve( ['abc', 'def' ]);
    			}
    	};
    	var SSHClientMock = {
    			exec: function() {
    				return Promise.resolve();
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, UtilsMock, CloudClientMock, SSHClientMock );
		
    	
    	try {
    		oTested.handle( oClusterConfig, { target: "master" } );
    		done( 'Expecting error' );
    	} catch( e ) {
    		done();
    	}
	});
	
	it('ssh client exec error',function(done){
		var HpccClusterMock = {
    			mod: function() {},
				refresh_state: function() {
    				return Promise.resolve();
    			}
    	}
    	
    	var UtilsMock = {
    	};
    	
    	var CloudClientMock = {
    			describe_instances: function() {
    				return Promise.resolve( DESCRIBE_INSTANCES_RESPONSE );
    			},
    			get_all_ec2_instance_ids_from_cluster: function() {
    				return Promise.resolve( ['abc', 'def' ]);
    			}
    	};
    	var SSHClientMock = {
    			exec: function() {
    				throw new Error('fake error');
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, UtilsMock, CloudClientMock, SSHClientMock );
		
    	
    	var options = { parent: {}, target: 'this-is-a-test-node', cmd:'hostname' };
    	var oActual = oTested.handle( oClusterConfig, options );
    	
    	oActual.then( function() {
    		done( 'Expecting error' );
    	}, function( pError ) {
    		done();
    	});
	});
	
	it('ssh client exec reject',function(done){
		var HpccClusterMock = {
    			mod: function() {},
				refresh_state: function() {
    				return Promise.resolve();
    			}
    	}
    	
    	var UtilsMock = {
    	};
    	
    	var CloudClientMock = {
    			describe_instances: function() {
    				return Promise.resolve( DESCRIBE_INSTANCES_RESPONSE );
    			},
    			get_all_ec2_instance_ids_from_cluster: function() {
    				return Promise.resolve( ['abc', 'def' ]);
    			}
    	};
    	var SSHClientMock = {
    			exec: function() {
    				return Promise.reject( new Error('some fake error') );
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, UtilsMock, CloudClientMock, SSHClientMock );
		
    	
    	var options = { parent: {}, target: 'this-is-a-test-node', cmd:'hostname' };
    	var oActual = oTested.handle( oClusterConfig, options );
    	
    	oActual.then( function() {
    		done( 'Expecting error' );
    	}, function( pError ) {
    		done();
    	});
	});
	
	it('should run',function(done){
		var HpccClusterMock = {
    			mod: function() {},
				refresh_state: function() {
    				return Promise.resolve();
    			}
    	}
    	
    	var UtilsMock = {
    	};
    	
    	var CloudClientMock = {
    			describe_instances: function() {
    				return Promise.resolve( DESCRIBE_INSTANCES_RESPONSE );
    			},
    			get_all_ec2_instance_ids_from_cluster: function() {
    				return Promise.resolve( ['abc', 'def' ]);
    			}
    	};
    	var SSHClientMock = {
    			exec: function() {
    				return Promise.resolve( 'TODO: dunno what data looks like.' );
    			}
    	}
		var oTested = new TestedClass( HpccClusterMock, Logger, UtilsMock, CloudClientMock, SSHClientMock );
		
    	
    	var options = { parent: {}, target: 'this-is-a-test-node', cmd:'hostname' };
    	var oActual = oTested.handle( oClusterConfig, options );
    	
    	oActual.then( function() {
    		done();
    	}, function( pError ) {
    		console.error('Failed!');
    		if ( pError ) console.error( pError );
    		done( pError );
    	});
    	
	});
});
