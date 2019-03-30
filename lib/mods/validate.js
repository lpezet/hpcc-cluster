


ModClass = function( pHpccCluster, pLogger, pUtils, pCloudClient ) {
	pHpccCluster.mod( 'validate', this, this.handle );
	this.mLogger = pLogger;
	this.mUtils = pUtils;
	this.mCloudClient = pCloudClient;
	this.mRoot = pHpccCluster;
}


ModClass.prototype.handle = function( pConfig, pParameters ) {
	var that = this;
	return new Promise( function( resolve, reject ) {
		if ( pConfig.Email === 'youremail@myorg.com' || pConfig.Email === ''  ) {
			throw new Error("You must provide your email address in cluster.config file.");
		}
		//console.log( "\t%j", mInternalConfig.Cluster );
		//WARNING: depends on another mod here!!!!
		this.mRoot.create_cloudformation_templates( pConfig, pParameters ).then( function( pClusterTemplate ) {
			var oParams = {
					TemplateBody: pClusterTemplate,
			}
			console.log("Validating template...");
			//console.log( pClusterTemplate );
			that.mCloudClient.validate_template( oParams ).then( function ( pResult ) {
				console.log("Done validating template.");
				console.log( pResult ); //TODO: revisit when/where such results should be displayed.
				resolve( pResult );
			}, function( pError ) {
				console.log("Error validating templates. See logs for details.");
				reject( pError );
			})
		}, function( pError ) {
			console.log("Unexpected error validating templates. See logs for details.");
			reject( pError );
		});
	
	});
};

exports = module.exports = ModClass;
