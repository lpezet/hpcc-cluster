const assert = require('chai').assert;

const TestedClass = new require('../lib/utils');
const Tested = new TestedClass();

describe('Utils',function(){
	
	before(function(done){
		done();
	});
	
	after(function(done) {
		done();
	});

	it('pad',function(){
		assert.equal( Tested.pad( 123, 5 ), "00123" );
		assert.equal( Tested.pad( 123, 1 ), "123" );
		assert.equal( Tested.pad( 123, 10 ), "0000000123" );
	});
	
	it('nodeId',function(){
		assert.equal( Tested.nodeId( 1 ), 	"node00001" );
		assert.equal( Tested.nodeId( 123 ), "node00123" );
		assert.equal( Tested.nodeId( 12 ), 	"node00012" );
	});
	
	it('getAddrIP',function(){
		assert.equal( Tested.getAddrIP( '192.168.0.10/24' ),	"192.168.0.10" );
		assert.equal( Tested.getAddrIP( '172.16.9.0/24' ),		"172.16.9.0" );
		assert.equal( Tested.getAddrIP( '10.0.0.0/24' ), 		"10.0.0.0" );
	});
	
	it('merge_new_only',function(){
		var oSource = {
				"a": 1,
				"b": 2,
				"d": 4
		};
		assert.deepEqual( Tested.merge_new_only( oSource, { "a": 10, "c": 3 } ), { "a": 10, "b": 2, "c": 3, "d": 4 } );
		assert.deepEqual( Tested.merge_new_only( {}, { "a": 10, "c": 3 } ), { "a": 10, "c": 3 } );
		assert.deepEqual( Tested.merge_new_only( {}, {}  ), {} );
		assert.deepEqual( Tested.merge_new_only( { "a": 10, "c": 3 }, { "a": 10, "c": 3 } ), { "a": 10, "c": 3 } );
		
		// Special case for "Volumes/Devices"
		assert.deepEqual( Tested.merge_new_only( { "a": 10, "Volumes": [ { "DeviceName": "abc", "VolumeSize": 0 } ] }, { "a": 10, "Volumes": [ { "DeviceName": "abc", "VolumeSize": 99 }, { "DeviceName": "def", "VolumeSize": 123 } ] } ), { "a": 10, "Volumes": [ { "DeviceName": "abc", "VolumeSize": 99 }, { "DeviceName": "def", "VolumeSize": 123 } ] } );
	});
	
	it('state_get_node_public_ip', function() {
		assert.isNull( Tested.state_get_node_public_ip( null, 'master' ) );
		assert.isNull( Tested.state_get_node_public_ip( {}, 'master' ) );
		assert.isNull( Tested.state_get_node_public_ip( { Topology: {} }, null ) );
	});
	
	it('resolve_target', function() {
		assert.equal( Tested.resolve_target(null, '1.2.3.4'), '1.2.3.4' );
		assert.equal( Tested.resolve_target(null, 'master'), 'master' );
		assert.equal( Tested.resolve_target({ Topology: { 
			"slave00001": { NetworkInterfaces: [ { Association: { PublicIp: "1.2.3.4" } } ] } 
		}}, '@slave00001'), '1.2.3.4' );
		assert.equal( Tested.resolve_target({ Topology: { 
			"slave00001": { NetworkInterfaces: [ { Association: { PublicIp: "1.2.3.4" } } ] },
			"slave00002": { NetworkInterfaces: [ { Association: { PublicIp: "5.6.7.8" } } ] },
		}}, '@slave00001'), '1.2.3.4' );
		assert.equal( Tested.resolve_target({ Topology: { 
			"master": { NetworkInterfaces: [ { Association: { PublicIp: "1.2.3.4" } } ] } 
		}}, null), '1.2.3.4' );
	});
	
	it('find_PublicIp',function(){
		assert.isNull( Tested.find_PublicIp( null ) );
		assert.isNull( Tested.find_PublicIp( {} ) );
		assert.isNull( Tested.find_PublicIp( { NetworkInterfaces: [] } ) );
		assert.isNull( Tested.find_PublicIp( { NetworkInterfaces: [ { Association: { PrivateIp: "1.2.3.4" } } ] } ) );
		
		var oInstanceStatus = {
				NetworkInterfaces: [
					{ 
						Association: {
							PublicIp: "1.1.1.1"
						}
					}
				]
		};
		assert.equal( Tested.find_PublicIp( oInstanceStatus ), "1.1.1.1");
		
	});
	
	it('merge_devices',function(){
		var oSource = [
			{
				"DeviceName": "/dev/xvda",
				"Ebs": {
		            "DeleteOnTermination": true,
		            "VolumeSize": '8',
		            "VolumeType": "gp2"
				}
			},
			{
				"DeviceName": "/dev/xvdz",
				"Ebs": {
		            "DeleteOnTermination": true,
		            "VolumeSize": '3',
		            "Encrypted": true,
		            "VolumeType": "gp2"
				}
			}
		];
		
		var oSimpleSources = [
			{ "DeviceName": "/dev/xvda" },
			{ "DeviceName": "/dev/xvdb" },
			{ "DeviceName": "/dev/xvdd" }
		]
		var oActual = [];
		Tested.merge_devices( oSimpleSources, oActual );
		assert.deepEqual( oActual, [ { "DeviceName": "/dev/xvda" }, { "DeviceName": "/dev/xvdb" }, { "DeviceName": "/dev/xvdd" } ] );
		
		oActual = [ { "DeviceName": "/dev/xvdc" } ];
		Tested.merge_devices( oSimpleSources, oActual );
		assert.deepEqual( oActual, [ { "DeviceName": "/dev/xvdc" }, { "DeviceName": "/dev/xvda" }, { "DeviceName": "/dev/xvdb" }, { "DeviceName": "/dev/xvdd" } ] );
		
		oActual = [ { "DeviceName": "/dev/xvda" } ];
		Tested.merge_devices( oSimpleSources, oActual );
		assert.deepEqual( oActual, [ { "DeviceName": "/dev/xvda" }, { "DeviceName": "/dev/xvdb" }, { "DeviceName": "/dev/xvdd" } ] );
		
		oActual = [];
		Tested.merge_devices( oSource, oActual );
		assert.deepEqual( oActual, oSource );
		
		oActual = [
			{
				"DeviceName": "/dev/xvda",
				"Ebs": {
		            "DeleteOnTermination": true,
		            "VolumeSize": '800',
		            "VolumeType": "gp2"
				}
			}
		];
		Tested.merge_devices( oSource, oActual );
		assert.deepEqual( oActual, [ 
			{
				"DeviceName": "/dev/xvda",
				"Ebs": {
		            "DeleteOnTermination": true,
		            "VolumeSize": '800',
		            "VolumeType": "gp2"
				}
			},
			{
				"DeviceName": "/dev/xvdz",
				"Ebs": {
		            "DeleteOnTermination": true,
		            "VolumeSize": '3',
		            "Encrypted": true,
		            "VolumeType": "gp2"
				}
			}
		] );
		
	});
	
});
