


ModClass = function( pHpccCluster, pLogger, pUtils, pCloudClient ) {
	
	pHpccCluster.mod( 'status', this, this.estimate );
	this.mLogger = pLogger;
	this.mUtils = pUtils;
	this.mCloudClient = pCloudClient;
	this.mRoot = pHpccCluster;
}


ModClass.prototype.estimate = function( pConfig, pParameters ) {
	that = this;
	return new Promise( function( resolve, reject ) {
		try {
			//WARNING: depends on another mod!
			that.create_cloudformation_templates( pConfig, pParameters ).then( function( pClusterTemplate ) {
				var oBaseParameters = [
		     		{
		     			"ParameterKey": "ParamSubnetId",
		     			"ParameterValue": pConfig.Vpc.SubnetId
		     		},
		     		{
		     			"ParameterKey": "ParamSecurityGroupId",
		     			"ParameterValue": pConfig.Vpc.SecurityGroupId
		     		}
		     	];
		     	var oParams = {
		     		TemplateBody: pClusterTemplate,
		     		Parameters: oBaseParameters
		     	};
				that.mCloudClient.estimateTemplateCost( oParams, function( error, data ) {
					if (error) {
						reject( error );
					} else {
						console.log( data );
						resolve( 'Ok!');
					}
				});
			}, function( pError ) {
				reject( pError );
			});
		
		} catch (e) {
			reject(e);
		}
	});
};

exports = module.exports = ModClass;
