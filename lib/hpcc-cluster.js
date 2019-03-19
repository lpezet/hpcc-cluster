const Fs = require('fs');
const path = require('path');
const Moniker = require("moniker");
//const EventEmitter = require("events").EventEmitter;


const _ = require('underscore');
//const WORK_DIR = ".hpcc-cluster";
const CLUSTER_STATE_FILE = path.resolve(process.cwd(), ".cluster")

HpccClusterClass = function( pLogger, pErrorHandler, pUtils ) {
	/*
	var oLocalDir = path.resolve(process.cwd(), WORK_DIR);
	this.mInternalConfig = {
			Templates: {
				TemplateMacros: "templates/macros.vm",
				ClusterConfig: "templates/cluster.config.sample",
				MyConfig: "templates/my.config.sample",
				TemplateVPC: "templates/vpc.template.yaml",
				//TemplateCluster: "templates/cluster.template.yaml",
				TemplateCluster: "templates/cluster.template.yaml",
				TemplateClusterNode: "templates/node.template.yaml",
				TemplateEnv: "environment_v2.xml.vm"
			},
			LocalDir: oLocalDir,
			//TODO: load/save internal state. Like Master Public Ip, which could be refresh with a simple "status" command.
			//Config: path.resolve(process.cwd(), ".hpcc.config")
			ClusterStateFile: oLocalDir + "/cluster"
	}
	*/
	this.mLogger = pLogger;
	this.mNameGenerator = Moniker.generator([Moniker.adjective, Moniker.noun]);
	this.mUtils = pUtils;
	this.mErrorHandler = pErrorHandler;
	this.mClusterState = null;
};

//HpccClusterClass.prototype.STACK_PREFIX = "hpcc-v3-";
//HpccClusterClass.prototype.CLUSTER_CONFIG_FILE_NAME = "cluster.config";
//HpccClusterClass.prototype.MY_CONFIG_FILE_NAME = "my.config";
//HpccClusterClass.prototype.WORK_DIR = WORK_DIR;

/*
HpccClusterClass.prototype.resolve_template = function( pTemplateName ) {
	
}
*/

HpccClusterClass.prototype._handle_error = function( pError, pPromise ) {
	this.handle_error( pError, pPromise );
}

HpccClusterClass.prototype.handle_error = function( pError, pPromise ) {
	this.mErrorHandler.doHandle( pError, pPromise );
}

HpccClusterClass.prototype._resolve_target = function( pState, pTarget ) {
	return this.mUtils.resolve_target( pState, pTarget );
}
/*
HpccClusterClass.prototype._default_error_handling = function( pError, pPromise ) {
	console.log( 'Error: ' + pError );
	winston.log('error', pError);
	if ( pPromise ) oPromise.reject( pError );
	return that.mUtils.promiseFailure( pError );
};
*/
//#############################################################################
//# Public methods
//#############################################################################
HpccClusterClass.prototype.resolve_path = function( pFilename ) {
	return path.resolve(process.cwd(), pFilename);
};

HpccClusterClass.prototype.extend = function( pSource, pKeys ) {
	if ( pKeys ) {
		_.extend( this, _.pick( pSource, pKeys ));
	} else {
		_.extend( this, pSource );
	}
}
HpccClusterClass.prototype.mod = function( pKey, pSource, pFn ) {
	this[ pKey ] = pFn.bind( pSource );
}

HpccClusterClass.prototype.get_state = function( pConfig, pStatusResult ) {
	if ( this.mClusterState ) return Promise.resolve( this.mClusterState );
	return this.load_state().then( function( pData ) { this.mClusterState = pData; return Promise.resolve( pData ); }, function ( pError ) { return Promise.reject( pError ); });
}

HpccClusterClass.prototype._get_state = function( pConfig, pStatusResult ) {
	return this.get_state( pConfig, pStatusResult );
}

HpccClusterClass.prototype.save_state = function( pConfig, pStatusResult ) {
	var that = this;
	return new Promise( function( resolve, reject) {
		//console.log('Status data:');
		//console.dir( pData );
		var friendly_node_name = function( pFullStackNodeName ) {
			return pFullStackNodeName.toLowerCase().replace(/.*(master|support|slave)[- ]node(\d+)?/g, '$1$2');
		}
		var oState = { "LastUpdateTime": new Date(), "Topology": {} };
		for ( var i in pStatusResult ) {
			//console.log('i = ' + i);
			var n = pStatusResult[i];
			var oName = n["Name"];
			var oFriendlyName = friendly_node_name( oName );
			oState["Topology"][ oFriendlyName ] = n;
		}
		//console.dir( oState );
		//var oFile = path.resolve(__dirname, this.mInternalConfig.ClusterStateFile);
		//if ( Fs.existsSync( CLUSTER_STATE_FILE ) ) {
			Fs.writeFile( CLUSTER_STATE_FILE, JSON.stringify( oState ), {encoding: 'utf8'}, function( err2 ) {
				if ( err2 ) {
					that.mLogger.error('Unexpected error writing state to file.', err2);
					reject( err2 );
				} else {
					that.mLogger.debug('State saved.');
					//console.log('State saved.');
					resolve( oState );
				}
			});
		//} else {
		//	var err = 'File ' + CLUSTER_STATE_FILE + ' does not exist. Cannot save state of cluster.';
		//	that.mLogger.error(err);
		//	reject( err );
		//}
		
	});
};

HpccClusterClass.prototype._save_state = function( pConfig, pStatusResult ) {
	return this.save_state( pConfig, pStatusResult );
}

//TODO: means it requires the "status" mod.
HpccClusterClass.prototype.refresh_state = function( pConfig, pParameters ) {
	if ( this['status'] ) {
		return this.status( pConfig, { "outputToConsole": true } );
	} else {
		return Promise.reject('Need status mod to get status of cluster.');
	}
};

HpccClusterClass.prototype._refresh_state = function( pConfig, pParameters ) {
	return this.refresh_state( pConfig, pParameters );
};

HpccClusterClass.prototype.load_state = function() {
	var that = this;
	// Check if file exists ClusterStateFile
	// If it does, load it into this.mClusterState
	return new Promise( function( resolve, reject) {
		var oStateFile = CLUSTER_STATE_FILE;
		
		if ( Fs.existsSync( oStateFile ) ) {
			Fs.readFile( oStateFile, {encoding: 'utf8'}, function( err, data) {
				if ( err ) {
					that.mLogger.error('Unexpected error loading state.', err);
					reject( err );
				} else {
					resolve( JSON.parse(data) );
				}
			});
		} else {
			resolve( {} );
		}
	});
};

HpccClusterClass.prototype._load_state = function() {
	return this.load_state();
}

exports = module.exports = HpccClusterClass;
