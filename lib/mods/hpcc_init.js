const Fs = require('fs');


ModClass = function( pHpccCluster, pLogger, pUtils, pSSHClient) {
	pHpccCluster.mod( 'hpcc-init', this, this.handle );	
	this.mRoot = pHpccCluster;
	this.mSSHClient = pSSHClient;
	this.mUtils = pUtils;
	this.mLogger = pLogger;
}

ModClass.prototype.handle = function( pConfig, pParameters ) {
	var that = this;
	if ( !pParameters.cmd )
		throw "Must provide cmd to run with hpcc-init."
	return new Promise( function( resolve, reject) {
		try {
			//const ssh = require('ssh2-client');
			// TODO: Handle case where .cluster (state) is say empty (e.g. topology is empty).
			// Target will be null (must fix _resolve_target to address that).
			// Need to trigger a _refresh_state in that case.
			//
			that.mRoot.get_state().then( function( pState ) {
				var oTarget = that.mUtils.resolve_target( pState, pParameters["target"] );
				that.mLogger.debug('hpcc-init ' + pParameters.cmd + ' with ' + oTarget + '...');
				const oOpts = {
						host: oTarget,
						username: "ec2-user",
						privateKey: Fs.readFileSync( pConfig.KeyPairFile )
				};
				
				const BASE_HPCC_INIT_CMD = 'sudo /opt/HPCCSystems/sbin/hpcc-run.sh -a hpcc-init ';
				const STOP_DAFILESRV_CMD = BASE_HPCC_INIT_CMD + '-c dafilesrv stop';
				const STOP_CMD = BASE_HPCC_INIT_CMD + 'stop';
				const COPY_ENV_XML_CMD = 'sudo -u hpcc cp /etc/HPCCSystems/source/environment.xml /etc/HPCCSystems/environment.xml';
				const PUSH_ENV_XML_CMD = 'sudo /opt/HPCCSystems/sbin/hpcc-push.sh -x -s /etc/HPCCSystems/environment.xml -t /etc/HPCCSystems/environment.xml';
				
				var oCmd = '';
				switch ( pParameters.cmd ) {
					case 'stop':
					case 'start':
					case 'status':
						oCmd = BASE_HPCC_INIT_CMD + pParameters.cmd;
						break;
					case 'stopAll':
						oCmd = STOP_CMD + ' && ' + STOP_DAFILESRV_CMD;
						break;
					case 'update':
						oCmd = '(' + STOP_CMD + ' && ' + STOP_DAFILESRV_CMD + '); ' + COPY_ENV_XML_CMD + ' && ' + PUSH_ENV_XML_CMD;
						break;
					default:
						throw "Command not supported: " + pParameters.cmd;
				}
				//ssh
				that.mSSHClient
				  .exec( oOpts, oCmd, function( err, output, stderr, server, conn) {
					  if ( conn ) conn.end();
					  if ( err ) {
						  reject( err );
					  } else {
						  resolve( output );
					  }
				  });
			}, function( pError ) {
				reject( pError );
			} );
		} catch (e) {
			reject( e );
		}
	});
};

exports = module.exports = ModClass;
