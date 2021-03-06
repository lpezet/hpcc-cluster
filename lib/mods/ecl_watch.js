const opn = require('opn');

ModClass = function( pHpccCluster, pLogger, pUtils ) {
	pHpccCluster.mod( 'ecl_watch', this, this.handle );
	this.mUtils = pUtils;
	this.mLogger = pLogger;
	this.mRoot = pHpccCluster;
}

ModClass.prototype.handle = function( pOutputFilePath, pParameters ) {
	var that = this;
	return new Promise( function( resolve, reject ) {
		this.mRoot.get_state().then( function( pState ) {
			var oMasterPublicIP = that.mUtils.state_get_node_public_ip( pState, 'master' );
			// NB: Does not handle https config.
			var oUrl = 'http://' + oMasterPublicIP + ':8010';
			console.log('Openning browser at: ' + oUrl);
			try {
				opn( oUrl );
				resolve();
			} catch( e ) {
				that.mRoot.handle_error( e, reject );
			}
		}, function( pError ) {
			that.mRoot.handle_error( pError, reject );
		});
	});
};

exports = module.exports = ModClass;
