
ModClass = function( pHpccCluster, pLogger, pUtils, pSSHClient) {
	pHpccCluster.mod( 'configmgr', this, this.configmgr );
	this.mLogger = pLogger;
	this.mRoot = pHpccCluster;
	this.mSSHClient = pSSHClient;
	this.mUtils = pUtils;
}


ModClass.prototype.configmgr = function( pConfig, pParameters ) {
	var that = this;
	return new Promise( function( resolve, reject ) {
		try {
			//const ssh = require('ssh2-client');
			this.mRoot.get_state().then( function( pState ) {
				var oTarget = that.mUtils.resolve_target( pState, pParameters["target"] );
				that.mLogger.debug('configmgr from ' + oTarget + '...');
				const oHost = "ec2-user@" + oTarget;
				const oOpts = {
						privateKey: pConfig.KeyPairFile
				};
				
				var oKillCmd = 'sudo kill -SIGINT $(cat /var/run/HPCCSystems/configmgr.pid)';
				var oStartCmd = 'nohup sudo /opt/HPCCSystems/sbin/configmgr > /dev/null 2>&1 &';
				var oCmd = '[ -f /var/run/HPCCSystems/configmgr.pid ] && (' + oKillCmd + ' && echo "Terminated") || ($(' + oStartCmd + ') && echo "Started")';
				//ssh
				that.mSSHClient
				  .exec(oHost, oCmd, oOpts)
				  //.then((output) => {
				  //  const { out, error } = output;
				  //  console.log(out);
				  //  console.error(error);
				  //})
				  //.catch(err => console.error(err));
				  .then( function( output ) {
					  const { out } = output;
					  //console.log( out );
					  //console.log( error );
					  switch ( out.trim() ) {
					  	case 'Terminated':
					  		that.mLogger.info('Shutting down Config Manager...');
					  		break;
					  	case 'Started':
					  		var oUrl = 'http://' + oTarget + ':8015/';
					  		var oMsg = 'Config Manager started. Opening url:\n' + oUrl;
					  		that.mLogger.info(oMsg);
					  		try {
						  		var open = require("open");
						  		open( oUrl );
						  		resolve();
					  		} catch ( e ) {
					  			that.mRoot.handle_error( e, reject );
					  		}
					  		break;
					  }
				  }, function(err) {
					  that.mRoot.handle_error( err, reject );
				  });
				  //.catch(err => console.error(err));
			}, function( pError ) {
				that.mRoot.handle_error( pError, reject );
				//console.error( pError );
				//winston.log('error', pError);
			});
		} catch (e) {
			that.mRoot.handle_error( e, reject );
			//console.error( e );
			//winston.log('error', e);
		}
	});
	
};


exports = module.exports = ModClass;
