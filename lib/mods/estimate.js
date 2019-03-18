


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
						that.mRoot.handle_error( error, reject );
						//winston.log('error',error );
						//oPromise.reject( error );
					} else {
						//winston.log('info', data2);
						console.log( data );
						//var oStackResources = data2.StackResourceSummaries;
						oPromise.resolve( 'Ok!');
					}
				});
			}, function( pError ) {
				that.mRoot.handle_error( pError, reject );
				//winston.log('error', pError);
				//oPromise.reject( pError );
			});
		
		} catch (e) {
			that.mRoot.handle_error( e, reject );
			//oPromise.reject( e );
			//console.error( e );
			//winston.log('error', e);
		}
	});
};

exports = module.exports = ModClass;
