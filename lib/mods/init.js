const Fs = require('fs');
const path = require('path');
const util = require('util');
const Moniker = require("moniker");
const VelocityEngine = require('velocity').Engine;
const Promises = require('../promises');

//STACK_PREFIX = "hpcc-v3-";
CLUSTER_CONFIG_FILE_NAME = "cluster.config";
MY_CONFIG_FILE_NAME = "my.config";
//HpccClusterClass.prototype.WORK_DIR = WORK_DIR;

const DEFAULT_SETTINGS = {
		ClusterConfig: path.resolve(__dirname, "templates/cluster.config.sample"),
		MyConfig: path.resolve(__dirname, "templates/my.config.sample"),
		WorkDir: path.resolve(process.cwd(), ".hpcc-cluster/"),
}

ModClass = function( pHpccCluster, pLogger, pSettings ) {
	//pHpccCluster.extend( pHpccCluster, this, ["init"] );
	/*
	var that = this;
	pHpccCluster['init'] = function( pParameters ) {
		that.init( pParameters);
	};
	*/
	pHpccCluster.mod( 'init', this, this.init );
	this.mRoot = pHpccCluster;
	this.mLogger = pLogger;
	this.mSettings = pSettings || DEFAULT_SETTINGS;
}

ModClass.prototype.init = function( pParameters ) {
	var that = this;
	//return new Promise( function( resolve, reject ) {
	const oLocalDir = process.cwd(); // pParameters.WorkDir || process.cwd();
	var oClusterConfigFile = path.resolve( oLocalDir, CLUSTER_CONFIG_FILE_NAME);
	var oMyConfigFile = path.resolve( oLocalDir, MY_CONFIG_FILE_NAME);
	
	if ( Fs.existsSync( oClusterConfigFile ) && ! pParameters.force ) {
		var oErrorMsg = 'File %s already exists. Use argument -f to force initialization (and file will be overwritten).';
		that.mLogger.error( oErrorMsg, oClusterConfigFile );
		return Promise.reject( util.format( oErrorMsg, oClusterConfigFile ) );
	} else {
		var generate_cluster_config_file = function() {
			return new Promise( function( resolve, reject ) {
				Fs.readFile( path.resolve(__dirname, that.mSettings.ClusterConfig), {encoding: 'utf8'}, function( err, data) {
					if ( err ) {
						//that.mRoot.handle_error( err, reject );
						reject( err );
					} else {
						var oTemplate = data;
						var oVEngine = new VelocityEngine( { template: oTemplate } );
						
						var oNameGenerator = Moniker.generator([Moniker.adjective, Moniker.noun]);
						var oTemplateVars = {};
						oTemplateVars['cluster_name'] = that.mRoot.STACK_PREFIX + oNameGenerator.choose();
						var oSampleConfig = oVEngine.render( oTemplateVars );
						var oNewFile = oClusterConfigFile;
						try {
							//Fs.writeFile( oNewFile, yaml.safeDump( oSample ), {encoding: 'utf8'}, function( err2 ) {
							Fs.writeFile( oNewFile, oSampleConfig, {encoding: 'utf8'}, function( err2 ) {
								if ( err2 ) {
									//that.mRoot.handle_error( err2, reject );
									//winston.log('error', error);
									reject( err2 );
								} else {
									that.mLogger.debug('File %s created.', oClusterConfigFile);
									console.log('Cluster config file created.');
									resolve();
								}
							});
						} catch (e) {
							//that.mRoot.handle_error( e, reject );
							//console.error( e );
							reject( e );
						}
						
						
					}
				});
			});
		}
		
		var generate_my_config_file = function( data ) {
			return new Promise( function( resolve, reject ) {
				Fs.readFile( path.resolve(__dirname, that.mSettings.MyConfig), {encoding: 'utf8'}, function( err, data) {
					if ( err ) {
						//that.mRoot.handle_error( err, reject );
						reject( err );
					} else {
						var oTemplate = data;
						var oVEngine = new VelocityEngine( { template: oTemplate } );
						
						//var oNameGenerator = Moniker.generator([Moniker.adjective, Moniker.noun]);
						var oTemplateVars = {};
						//oTemplateVars['cluster_name'] = STACK_PREFIX + oNameGenerator.choose();
						var oSampleConfig = oVEngine.render( oTemplateVars );
						var oNewFile = oMyConfigFile;
						try {
							//Fs.writeFile( oNewFile, yaml.safeDump( oSample ), {encoding: 'utf8'}, function( err2 ) {
							Fs.writeFile( oNewFile, oSampleConfig, {encoding: 'utf8'}, function( err2 ) {
								if ( err2 ) {
									that.mRoot.handle_error( err2, reject );
									//winston.log('error', error);
									//oPromise.reject( error );
								} else {
									that.mLogger.debug('File %s created.', oMyConfigFile);
									console.log('My config file created.');
									resolve();
								}
							});
						} catch (e) {
							//that.mRoot.handle_error( e, reject );
							//console.error( e );
							reject( e );
						}
						
						
					}
				});
			});
		};
		
		var create_work_dir = function() {
			return new Promise( function( resolve, reject ) {
				// Create base dir
				try {
					if ( ! Fs.existsSync( that.mSettings.WorkDir ) ) {
						Fs.mkdirSync( that.mSettings.WorkDir );
					}
					resolve();
				} catch ( e ) {
					//that.mRoot.handle_error( e, reject );
					reject( e );
				}
			});
		}
		var oSequence = [ generate_cluster_config_file, generate_my_config_file, create_work_dir ];
		return Promises.seq( oSequence, {} );
		/*PromiseSeq( oSequence ).then( function( pData ) {
			oPromise.resolve( pData );
		},  function( pError ) {
			that.mRoot.handle_error( pError, oPromise );
		} );
		*/
		
	}
	//});
	
};


exports = module.exports = ModClass;
