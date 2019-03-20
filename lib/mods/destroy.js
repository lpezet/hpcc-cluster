
ModClass = function( pHpccCluster, pLogger ) {
	pHpccCluster.mod( 'destroy', this, this.destroy );
	this.mLogger = pLogger;
}

ModClass.prototype.destroy = function( pConfig, pParameters ) {
	return Promise.reject( 'Not implemented!' );
};

exports = module.exports = ModClass;
