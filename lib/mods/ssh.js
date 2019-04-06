const Fs = require('fs');

ModClass = function( pHpccCluster, pLogger, pUtils, pSSHClient ) {
	pHpccCluster.mod( 'ssh', this, this.handle );
	this.mRoot = pHpccCluster;
	this.mUtils = pUtils;
	this.mSSHClient = pSSHClient;
	this.mLogger = pLogger;
}

ModClass.prototype.handle = function( pConfig, pParameters ) {
	var that = this;
	return new Promise( function( resolve, reject) {
		try {
			that.mRoot.get_state().then( function( pState ) {
				var oTarget = that.mUtils.resolve_target( pState, pParameters["target"] );	
				that.mLogger.debug("ssh: target %s resolved into %s", pParameters["target"], oTarget);
				//const oHost = "ec2-user@" + oTarget;
				const oOpts = {
						host: oTarget,
						username: 'ec2-user',
						privateKey: Fs.readFileSync( pConfig.KeyPairFile )
				};
				//ssh
				that.mSSHClient
				  .shell(oOpts, function( err ) {
					  if (err) {
						  console.log('Done with error(s).');
						  reject( err );
					  } else {
						  console.log('Done.');
						  resolve();
					  }
				  });
			}, function( pError ) {
				reject( pError );
			})
			.catch( function(pError) {
				reject( pError );
			});
		} catch (e) {
			reject(e);
		}
	});
};


exports = module.exports = ModClass;
