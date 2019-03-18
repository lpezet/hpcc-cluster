const Promises = require('../promises');

ModClass = function( pHpccCluster, pLogger, pUtils, pCloudClient ) {
	
	pHpccCluster.mod( 'status', this, this.status );
	this.mLogger = pLogger;
	this.mUtils = pUtils;
	this.mCloudClient = pCloudClient;
	this.mRoot = pHpccCluster;
}

ModClass.prototype.status = function( pConfig, pParameters ) {
	var that = this;
	
	//return new Promise( function( resolve, reject ) {
		try {
			
			var oCheckStackExists = function() {
				return that.mCloudClient.stack_exists( pConfig.Cluster.Name, pConfig.Cluster.Name );
			}
			var oGetAllEC2InstanceIds = function() {
				return that.mCloudClient.get_all_ec2_instance_ids_from_cluster( pConfig.Cluster.Name );
			}
			var oListEC2InstancesStatus = function( pInstanceIds ) {
				return that.mCloudClient.describe_ec2_status( pInstanceIds, pParameters["outputToConsole"] );
			}
			var oSaveState = function( pData ) {
				//console.log( 'State:' );
				//console.dir( pData );
				return new Promise( function( resolve, reject ) {
					var ret = function() {
						resolve( pData );
					}
					that.mRoot.save_state( pConfig, pData ).then( ret, ret ); // reset state, ignore error when saving state
				});
			}
			
			var oSequence = [ oCheckStackExists, oGetAllEC2InstanceIds, oListEC2InstancesStatus, oSaveState ];
			return Promises.seq( oSequence, {} );
			/*
			PromiseSeq( oSequence ).then( function( pData ) {
				resolve( pData );
			},  function( pError ) {
				that.mRoot.handle_error( pError, reject );
			} );
			*/
		} catch ( e ) {
			that.mRoot.handle_error( e, reject );
			//console.log( e );
			//oPromise.reject( e );
		}
	//});
};


exports = module.exports = ModClass;
