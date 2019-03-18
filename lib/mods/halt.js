const Promises = require('../promises');

ModClass = function( pHpccCluster, pLogger, pUtils, pCloudClient ) {
	pHpccCluster.mod( 'halt', this, this.halt );
	this.mLogger = pLogger;
	this.mUtils = pUtils;
	this.mCloudClient = pCloudClient;
	this.mRoot = pHpccCluster;
}



ModClass.prototype.halt = function( pConfig, pParameters ) {
	var that = this;
	//return new Promise( function( resolve, reject ) {
		try {
			var oGetAllEC2InstanceIds = function() {
				that.mCloudClient.get_all_ec2_instance_ids_from_cluster( pConfig.Cluster.Name );
			};
			var oStopInstances = function( pInstanceIds ) {
				var oEc2InstancesParams = {
					InstanceIds: pInstanceIds,
					DryRun: pConfig.DryRun
				};
				that.mLogger.debug('About to stop instances: %s', pInstanceIds);
				console.log('About to stop instances: %s', pInstanceIds);
				return that.mCloudClient.stop_instances_to_completion( oEc2InstancesParams );
			};
			var oResetState = function( pData ) {
				return new Promise( function( resolve, reject ) {
					var ret = function() {
						that.mLogger.debug('Instances %s stopped.', pData);
						console.log('Instances stopped.');
						resolve( pData );
					}
					that.mRoot.save_state( pConfig, {} ).then( ret, ret ); // reset state, ignore error when saving state
				});
			
			};
			
			var oSequence = [ oGetAllEC2InstanceIds, oStopInstances, oResetState ];
			return Promises.seq( oSequence, {} )
			/*.then( function( pData ) {
				resolve( pData );
			},  function( pError ) {
				that.mRoot._handle_error( pError, reject );
			});
			*/
		} catch( e ) {
			that.mRoot._handle_error( e );
			return Promise.reject( e );
			//console.log( e );
			//oPromise.reject( e );
		}
	//});
};


exports = module.exports = ModClass;
