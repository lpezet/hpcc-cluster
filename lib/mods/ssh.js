
ModClass = function( pHpccCluster, pLogger, pUtils, pSSHClient ) {
	pHpccCluster.mod( 'ssh', this, this.ssh );
	this.mRoot = pHpccCluster;
	this.mUtils = pUtils;
	this.mSSHClient = pSSHClient;
	this.mLogger = pLogger;
}

ModClass.prototype.ssh = function( pConfig, pParameters ) {
	var that = this;
	return new Promise( function( resolve, reject) {
		try {
			//const ssh = require('ssh2-client');
			that.mRoot.get_state().then( function( pState ) {
				//console.dir( pState );
				var oTarget = that.mUtils.resolve_target( pState, pParameters["target"] );
				that.mLogger.debug('ssh-ing into %s...', oTarget);
				const oHost = "ec2-user@" + oTarget;
				const oOpts = {
						privateKey: pConfig.KeyPairFile
				};
				//ssh
				that.mSSHClient
				  .shell(oHost, oOpts)
				  .then( function() {
					  console.log('Done');
					  resolve();
				  })
				  .catch(function(err) {
					  //console.error(err);
					  reject(err);
				  });
			}, function( pError ) {
				//that.mRoot.handle_error( pError );
				//console.error( pError );
				//winston.log('error', pError);
				reject( pError );
			});
		} catch (e) {
			//that.mRoot.handle_error( e );
			//console.error( e );
			//winston.log('error', e);
			reject(e);
		}
	});
};


exports = module.exports = ModClass;