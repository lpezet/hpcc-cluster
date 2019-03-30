
ModClass = function( pHpccCluster, pLogger ) {
	pHpccCluster.mod( 'destroy', this, this.handle );
	this.mLogger = pLogger;
}

ModClass.prototype.handle = function( pConfig, pParameters ) {
	return Promise.reject( 'Not implemented!' );
};

exports = module.exports = ModClass;
