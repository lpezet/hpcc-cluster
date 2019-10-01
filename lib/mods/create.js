//const Fs = require('fs');
//const path = require('path');
//const Promises = require('../promises');
//const VelocityEngine = require('velocity').Engine;
//const { yamlParse, yamlDump } = require('yaml-cfn');
//const Addr = require('netaddr').Addr;
//const sync_request = require('sync-request');

const CreateOnDemand = require('./create_ondemand');
const CreateSpot = require('./create_spot');


var clusterType = function( pConfig ) {
	if ( ! pConfig['Cluster'] ) return undefined;
	var oClusterType = pConfig['Cluster']['Type'] || 'on-demand';
	return 	oClusterType.toLowerCase();
}


ModClass = function( pHpccCluster, pLogger, pUtils, pCloudClient, pSettings) {
	pHpccCluster.mod( 'create', this, this.handle_create );
	pHpccCluster.mod( 'create_cloudformation_templates', this, this.handle_create_cloudformation_templates );
	pHpccCluster.mod( 'estimate', this, this.handle_estimate );
	pHpccCluster.mod( 'spot-price-history', this, this.handle_spot_price_history );
	
	this.mCreateOnDemand = new CreateOnDemand( pHpccCluster, pLogger, pUtils, pCloudClient, pSettings );
	this.mCreateSpot = new CreateSpot( pHpccCluster, pLogger, pUtils, pCloudClient, pSettings );
	
	this.mLogger = pLogger;
	this.mRoot = pHpccCluster;
	this.mCloudClient = pCloudClient;
	this.mUtils = pUtils;
}

ModClass.prototype.handle_spot_price_history = function( pConfig, pParameters ) {
	return that.mCreateSpot.handle_price_history( pConfig, pParameters );
};

ModClass.prototype.handle_estimate = function( pConfig, pParameters ) {
	var that = this;
	var oClusterType = clusterType( pConfig );
	switch( oClusterType ) {
		case undefined:
			return Promise.reject('Invalid configuration.');
		case 'spot':
			return that.mCreateSpot.handle_estimate( pConfig, pParameters );
		default:
			return that.mCreateOnDemand.handle_estimate( pConfig, pParameters );
	};
};

// Returns the master template
ModClass.prototype.handle_create_cloudformation_templates = function( pConfig, pParameters ) {
	var that = this;
	var oClusterType = clusterType( pConfig );
	switch( oClusterType ) {
		case undefined:
			return Promise.reject('Invalid configuration.');
		case 'spot':
			return that.mCreateSpot.handle_create_cloudformation_templates( pConfig, pParameters );
		default:
			return that.mCreateOnDemand.handle_create_cloudformation_templates( pConfig, pParameters );
	};
};

ModClass.prototype.handle_create = function( pConfig, pParameters ) {
	var that = this;
	if ( !pConfig.Email || pConfig.Email === 'youremail@yourorg.com' || pConfig.Email === ''  ) {
		throw new Error("You must provide your email address in cluster.config file.");
	}
	var oClusterType = clusterType( pConfig );
	switch( oClusterType ) {
		case undefined:
			return Promise.reject('Invalid configuration.');
		case 'spot':
			return that.mCreateSpot.handle_create( pConfig, pParameters );
		default:
			return that.mCreateOnDemand.handle_create( pConfig, pParameters );
	};
};

exports = module.exports = ModClass;
