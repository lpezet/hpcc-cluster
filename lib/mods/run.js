const Promises = require('../promises');

ModClass = function( pHpccCluster, pLogger, pUtils, pCloudClient, pSSHClient) {
	pHpccCluster.mod( 'run', this, this.run );
	this.mRoot = pHpccCluster;
	this.mSSHClient = pSSHClient;
	this.mUtils = pUtils;
	this.mCloudClient = pCloudClient;
	this.mLogger = pLogger;
}

ModClass.prototype._execute_cmd = function( pInstanceName, pIp, pKeyPairFile, pCmd, pPty ) {
	var that = this;
	return function() {
		return new Promise( function( resolve, reject ) {
			const oHost = "ec2-user@" + pIp;
			const oOpts = {
					privateKey: pKeyPairFile,
					pty: pPty
			};
			that.mSSHClient
				.exec(oHost, pCmd, oOpts)
				.then( function( data ) {
					data["instanceName"] = pInstanceName;
					data["publicIp"] = pIp;
					resolve( data );
				}, function( pError ) {
					reject( pError );
				})
				.catch( function(err) {
					reject( err );
				});
			
		});
	}
};

ModClass.prototype.run = function( pConfig, pParameters ) {
	if ( !pParameters.target || !pParameters.cmd)
		throw "Must provide target and cmd to run a command against resource(s).";
	
	if ( pConfig.DryRun ) {
		console.log( "NB: DryRun mode. Command won't be executed on hosts." );
	}
	var that = this;
	return new Promise( function( resolve, reject ) {
		try {
			var find_resource_name = function( pInstance ) {
				if ( ! pInstance['Tags'] ) return null;
				for ( var i in pInstance['Tags'] ) {
					var oKP = pInstance['Tags'][ i ];
					if ( oKP['Key'] === 'Name') return oKP['Value'];
				}
				return null;
			}
			
			var oGetAllInstances = that.mCloudClient.get_all_ec2_instance_ids_from_cluster( pConfig.Cluster.Name );
			
			oGetAllInstances.then( function( pInstanceIds ) {
				// Get public IP
				var oEc2Params = {
					InstanceIds: pInstanceIds
				};
				
				//console.log( 'Resources matching pattern: [' + oResourceNames + ']');
				
				that.mCloudClient.describe_instances( oEc2Params ).then( function( data ) {
					try {
						var oReservations = data.Reservations;
						var oCmdPromises = [];
						for ( var i = 0; i < oReservations.length; i++ ) {
							var oInstance = oReservations[i].Instances[0];
							var oInstanceName = find_resource_name( oInstance );
							if (!oInstanceName.match( pParameters.target )) {
								that.mLogger.debug('Skipping ' + oInstance.InstanceId + '(' + oInstanceName + '): does not match target ' +  pParameters.target );
								continue;
							}
							var oPublicIp = oInstance.PublicIpAddress;
							console.log( "Executing command on " + oInstance.InstanceId + " (" + oPublicIp + ")" );
							if ( !pConfig.DryRun ) {
								that.mLogger.debug('Executing command on ' + oInstance.InstanceId + '(' + oInstanceName + ')...');
								var CmdPromise = that._execute_cmd( oInstanceName, oPublicIp, pConfig.KeyPairFile, pParameters.cmd, pParameters.pty );
								oCmdPromises.push( CmdPromise );
							}
						}
						if ( oCmdPromises.length === 0 ) {
							console.log('Warning: Target "' + pParameters.target + '" did not match any nodes.');
						}
						Promises.seq( oCmdPromises, {} ).then( function( pResults ) {
							console.log( JSON.stringify( pResults ) );
							resolve( pResults );
						}, function( err ) {
							reject( err);
						});
					} catch ( error3 ) {
						reject( error3 );
					}
				}, function( error ) {
					reject( error );
				});
			}, function( pError ) {
				reject( pError );
			});
		} catch (e) {
			reject( e );
		}
	});
};

exports = module.exports = ModClass;
