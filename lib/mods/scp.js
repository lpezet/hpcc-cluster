const Fs = require('fs');

ModClass = function( pHpccCluster, pLogger, pUtils, pSSHClient ) {
	pHpccCluster.mod( 'scp', this, this.scp );
	this.mRoot = pHpccCluster;
	this.mUtils = pUtils;
	this.mLogger = pLogger;
	this.mSSHClient = pSSHClient;
}

ModClass.prototype.scp = function( pConfig, pParameters ) {
	var that = this;
	return new Promise( function( resolve, reject ) {
		var source = pParameters.source;
		var target = pParameters.target;
		if ( (source.indexOf("@") < 0 && target.indexOf("@") < 0) || ( source.indexOf("@") >= 0 && target.indexOf("@") >= 0 ) ) {
			reject("<source> or <target> must contain remote host using '@', and only one. For example:\nscp local_file.txt @1.2.3.4:/tmp/remote.txt\nThe command above would basically translate into:\nscp local_file.txt ec2-user@1.2.3.4:/tmp/remote.txt");
		} else {
			that.mRoot.get_state().then( function( pState ) {
				var create_public_ip_alias = function( pState ) {
					var alias = {};
					for (var i in pState['Topology'] ) {
						alias[ '@' + i ] = that.mUtils.find_PublicIp( pState['Topology'][ i ] );
					}
					return alias;
				}
				
				var oPublicIPAlias = create_public_ip_alias( pState );
				/*
				var oAtRegex = /(@[^:]+):/;
				var append_user_and_resolve_host = function(pValue) {
					var oRes = pValue;
					if( oRes.indexOf("@")  >= 0 && oRes.indexOf(":") > 0) {
						var oAtMatch = oRes.match( oAtRegex );
						if ( oAtMatch ) {
							var oAt = oAtMatch[1];
							var oPublicIP = oPublicIPAlias[ oAt ];
							oRes = oRes.replace( oAt, '@' + oPublicIP );
						}
					}
					return ( oRes.startsWith( "@" ) ? 'ec2-user' : '' ) + oRes;
				}
				source = append_user_and_resolve_host( source );
				target = append_user_and_resolve_host( target );
				*/
				
				var oTargetHostRegex = /(^[^:]+):/;
				var oTargetHostMatch = target.match( oTargetHostRegex );
				var oUsername = null;
				var oTargetHost = null;
				if ( oTargetHostMatch ) {
					var oTargetHostParts = oTargetHostMatch[1].split('@');
					if ( oTargetHostParts.length < 2 ) {
						oUsername = 'ec2-user'; // default
						oTargetHost = oTargetHostParts[0];
					} else {
						oTargetHost = oTargetHostParts[1];
						oUsername = oTargetHostParts[0];
					}
					var oPublicIP = oPublicIPAlias[ '@' + oTargetHost ];
					oTargetHost = oPublicIP;
					target = target.replace( oTargetHostMatch[1], '' ).substring( 1 );
				} else {
					//????
				}
				console.log('source = ' + source + ', target = ' + target + ', targetHost = ' + oTargetHost + ', username = ' + oUsername);
				const oClientOpts = {
						host: oTargetHost,
						username: oUsername,
						port: 22,
						privateKey: Fs.readFileSync( pConfig.KeyPairFile )
				};
				try {
					that.mSSHClient.scpFile( oClientOpts, target, source, function(err, stdout, stderr, server, conn) {
						if ( err ) {
							reject( err );
							return;
						}
						resolve( stdout );
					});
				/*
				
					const oSCP = require('scp2');
					oClient = new oSCP.Client({
					    port: 22,
					    privateKey: require('fs').readFileSync( pConfig.KeyPairFile )
					});
					winston.log('debug', 'scp: { source: ' + source + ', target: ' + target + ' }...');
					oSCP.scp( source, target, oClient, function(err) {
						if ( err ) {
							reject( err );
						} else {
							console.log('done.');
							resolve('scp done.');
						}
					});
				*/
				} catch (e) {
					reject( e );
				}
			}, function( pError ) {
				reject( pError );
			});
		}
	});
};

exports = module.exports = ModClass;
