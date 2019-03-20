const Promises = require('../promises');

ModClass = function( pHpccCluster, pLogger, pUtils, pCloudClient ) {
	pHpccCluster.mod( 'resume', this, this.resume );
	this.mUtils = pUtils;
	this.mCloudClient = pCloudClient;
	this.mRoot = pHpccCluster;
	this.mLogger = pLogger;
}

ModClass.prototype.resume = function( pConfig, pParameters ) {
	var that = this;
	try {
		var oGetAllEC2InstanceIds = function() {
			return that.mCloudClient.get_all_ec2_instance_ids_from_cluster( pConfig.Cluster.Name );
		};
		var oStartInstances = function( pInstanceIds ) {
			var oEc2InstancesParams = {
				InstanceIds: pInstanceIds,
				DryRun: pConfig.DryRun
			};
			that.mLogger.debug('About to start instances: %s', pInstanceIds);
			console.log('About to start instances: %s', pInstanceIds);
			return that.mCloudClient.start_instances_to_completion( oEc2InstancesParams );
		};
		var oRefreshState = function( pData ) {
			return new Promise( function( resolve, reject ) {
				var ret = function() {
					that.mLogger.debug('Instances %s now running.', pData);
					console.log('Instances running.');
					resolve( pData );
				}
				that.mRoot.refresh_state( pConfig ).then( ret, ret ); // refresh state, ignore error when saving state
			});
		}
		
		var oSequence = [ oGetAllEC2InstanceIds, oStartInstances, oRefreshState ];
		return Promises.seq( oSequence, {} );
	} catch( e ) {
		return Promise.reject( e );
	}
};

exports = module.exports = ModClass;
