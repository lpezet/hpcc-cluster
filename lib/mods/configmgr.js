const Fs = require('fs');
const opn = require('opn');

ModClass = function( pHpccCluster, pLogger, pUtils, pSSHClient) {
	pHpccCluster.mod( 'configmgr', this, this.handle );
	this.mLogger = pLogger;
	this.mRoot = pHpccCluster;
	this.mSSHClient = pSSHClient;
	this.mUtils = pUtils;
}


ModClass.prototype.handle = function( pConfig, pParameters ) {
	var that = this;
	return new Promise( function( resolve, reject ) {
		try {
			//const ssh = require('ssh2-client');
			that.mRoot.get_state().then( function( pState ) {
				var oTarget = that.mUtils.resolve_target( pState, pParameters["target"] );
				that.mLogger.debug('configmgr from ' + oTarget + '...');
				const oOpts = {
						host: oTarget,
						username: "ec2-user",
						privateKey: Fs.readFileSync( pConfig.KeyPairFile )
				};
				
				var oKillCmd = 'sudo kill -SIGINT $(cat /var/run/HPCCSystems/configmgr.pid)';
				var oStartCmd = 'nohup sudo /opt/HPCCSystems/sbin/configmgr > /dev/null 2>&1 &';
				var oCmd = '[ -f /var/run/HPCCSystems/configmgr.pid ] && (' + oKillCmd + ' && echo "Terminated") || ($(' + oStartCmd + ') && echo "Started")';
				//ssh
				that.mSSHClient.exec(oOpts, oCmd, function(err, output, stderr, server, conn) {
					if ( conn ) conn.end();
					if (err) {
						that.mLogger.error( err );
						  reject( err );
					} else {
						var out = new String(output).trim();
						switch ( out ) {
							case 'Terminated':
								that.mLogger.info('Shutting down Config Manager...');
								resolve();
						  		break;
						  	case 'Started':
						  		var oUrl = 'http://' + oTarget + ':8015/';
						  		var oMsg = 'Config Manager started. Opening url:\n' + oUrl;
						  		that.mLogger.info(oMsg);
						  		try {
							  		opn( oUrl, { wait: false } );
									resolve();
						  		} catch ( e ) {
						  			that.mLogger.error( e );
									reject( e );
						  		}
						  		break;
						}
					}
				});
			}, function( pError ) {
				that.mLogger.error( pError );
				reject( pError );
				//that.mRoot.handle_error( pError, reject );
				//console.error( pError );
				//winston.log('error', pError);
			});
		} catch (e) {
			that.mLogger.error( e );
			reject( e );
			//that.mRoot.handle_error( e, reject );
			//console.error( e );
			//winston.log('error', e);
		}
	});
	
};


exports = module.exports = ModClass;
