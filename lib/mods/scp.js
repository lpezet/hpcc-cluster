

ModClass = function( pHpccCluster, pLogger, pUtils ) {
	pHpccCluster.mod( 'scp', this, this.scp );
	this.mRoot = pHpccCluster;
	this.mUtils = pUtils;
	this.mLogger = pLogger;
}

ModClass.prototype.scp = function( pConfig, pParameters ) {
	var that = this;
	return new Promise( function( resolve, reject ) {
		var source = pParameters.source;
		var target = pParameters.target;
		if ( (! source.startsWith("@") && ! target.startsWith("@")) || ( source.startsWith("@") && target.startsWith("@") ) ) {
			reject("<source> or <target> must start with '@' for remote host, and only one or the other. For example:\nscp local_file.txt @1.2.3.4:/tmp/remote.txt\nThe command above would basically translate into:\nscp local_file.txt ec2-user@1.2.3.4:/tmp/remote.txt");
		} else {
			that.mRoot.get_state().then( function( pState ) {
				var create_public_ip_alias = function( pState ) {
					var alias = {};
					for (i in pState['Topology'] ) {
						alias[ '@' + i ] = that.mUtils.find_PublicIp( pState['Topology'][ i ] );
					}
					return alias;
				}
				
				var oPublicIPAlias = create_public_ip_alias( pState );
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
				//console.log('source = ' + source + ', target = ' + target );
				try {
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
