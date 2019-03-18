const Fs = require('fs');
const AWS = require('aws-sdk');
const Utils = require('./utils');
const { yamlParse } = require('yaml-cfn');
const path = require('path');
const LoggerClass = require('./winston-logger');
const SSH = require('ssh2-client');
const Promises = require('./promises'); 
const program = require('commander');

var HandlerClass = require('./handler');
var HandlerChainClass = require('./handlerChain');

const CONFIG_FILE_PATH = process.cwd();
const CLUSTER_CONFIG_FILE = path.resolve( CONFIG_FILE_PATH, "cluster.config");
const MY_CONFIG_FILE = path.resolve( CONFIG_FILE_PATH, "my.config");

var oClusterConfig = null;
if ( Fs.existsSync( CLUSTER_CONFIG_FILE ) ) {
	oClusterConfig = yamlParse( Fs.readFileSync( CLUSTER_CONFIG_FILE, {encoding: 'utf8'}) );
}
if ( oClusterConfig && Fs.existsSync( MY_CONFIG_FILE ) ) {
	oMyConfig = yamlParse( Fs.readFileSync( MY_CONFIG_FILE, {encoding: 'utf8'}) );
	for (i in oMyConfig ) {
		oClusterConfig[i] = oMyConfig[i];
	}
}

var logger = null;

class AWSErrorHandler extends HandlerClass {
	doHandle( pError, pReject, pHandlerChain ) {
		//console.log('AWSErrorHandler!!!');
		if ( pError && pError["code"] ) {
			this.doHandleAWSError( pError, pReject, pHandlerChain );
		}
		pHandlerChain.doHandle( pError, pReject );
	};
	
	
	doHandleAWSError( pError, pReject, pHandlerChain ) {
		switch (pError["code"]) {
			case "ExpiredToken":
				console.error( "AWS session token expired. Please generate new session token before trying again.");
				break;
			case "AccessDeniedException":
				console.error( "Current user may not be authorized to perfrom certain operations. Check log file for more details.");
				break;
			default:
				console.error( pError );
			break;
		}
	}
};

class DefaultErrorHandler extends HandlerClass {
	doHandle( pError, pReject, pHandlerChain ) {
		//console.log('DefaultErrorHandler!!!');
		logger.error(pError);
		if ( pReject ) pReject( pError );
		// Assumption is this is the last error handler.
	}
}

var createErrorHandlerChain = function() {
	return new HandlerChainClass( [ new AWSErrorHandler(), new DefaultErrorHandler() ] );
}

var register_mod = function( pHpccCluster, pMod) {
	var Class = require( pMod );
	
	var args = [ Class, pHpccCluster ];
	if ( arguments.length > 2 ) {
		args = args.concat( Array.prototype.slice.call(arguments, 2) );
	}
	
	return new (Class.bind.apply(Class, args ));
}

exports = module.exports = {
	//usage: function() {
	//	console.log( "Usage: hpcc-cluster <create|stop|start|terminate>" );
	//	process.exit()
	//},
	_closure: function( pPromise ) {
		//console.log("_closure!!!");
		//setTimeout(function() { console.log('doing something later on....'); }, 1000 );
		if ( pPromise ) {
			//TODO: need to wait on promise to complete
			//console.log('Promise!!!');
			//console.dir( pPromise );
			Promises.seq( pPromise, {} ).then( function( data ) {}, function( error ) { console.log('GOT ERROR!'); console.error( error ); } );
			//when( pPromise, function( data ) { }, function( error ) { console.error( error ); } ).wait();
			//pPromise.then( function( data ) { }, function( error ) { console.error( error ); } );
			
		} else {
			//console.log('No promise!!!');
		}
		//console.log("_closure done.");
	},
	setThingsUp: function( pOptions ) {
		try {
			var oTransports = [
				new (winston.transports.File)({ filename: 'etl-js.log', handleExceptions: true, humanReadableUnhandledException: true }),
	            new winston.transports.Console()
	        ];
			//var oLevel = 'info';
			
			if ( pOptions && pOptions.parent && pOptions.parent.logLevel ) {
				console.log('LogLevel=' + pOptions.parent.logLevel);
				oLevel = pOptions.parent.logLevel;
			}
			
			logger = new LoggerClass( {
				level: 'debug',
				transports: oTransports
			})
			
		} catch(e) {
			console.error(e);
			throw e;
		}
	},
	_run_command: function( pHpccClusterClass, pFunction, pArguments ) {
		options = (pArguments && pArguments.length > 0) ? pArguments[1] : { parent: {} };
		
		winston.level = (options.parent.debug) ? 'debug' : 'info';
		if ( winston.level === 'debug' ) {
			console.log('[in debug mode: logs will also output to console]');
			/* When using winston 3.x
			winston.add(new winston.transports.Console({
			    format: winston.format.simple()
			  }));
			 */
			winston.add(winston.transports.Console);
		}
		
		try {
			var oCredsConfig = {};
			if ( oClusterConfig && oClusterConfig['AWS'] && oClusterConfig['AWS']['Profile'] ) {
				oCredsConfig = { profile: oClusterConfig['AWS']['Profile'] };
				logger.debug('Using profile from configuration: [%s]', oCredsConfig.profile);
			} else if ( options.parent && options.parent.profile ) {
				oCredsConfig = { profile: options.parent.profile };
				logger.debug('Using profile from options: [%s]', oCredsConfig.profile);
			}
			var oUpdate = {};
			if ( oClusterConfig && oClusterConfig['AWS'] && oClusterConfig['AWS']['Region'] ) {
				oUpdate = { region: oClusterConfig['AWS']['Region'] };
				logger.debug('Using region from configuration: [%s]', oUpdate.region);
			} else if ( options.parent && options.parent.region ) {
				oUpdate = { region: options.parent.region };
				logger.debug('Using region from configuration: [%s]', oUpdate.region);
			}
			var oCredentials = new AWS.SharedIniFileCredentials( oCredsConfig );
			AWS.config.update( oUpdate );
			AWS.config.credentials = oCredentials;
			
			var CF = new AWS.CloudFormation();
			var S3 = new AWS.S3();
			var EC2 = new AWS.EC2();
			//var IAM = new AWS.IAM();
			var oSSM = new AWS.SSM();
			var oUtils = new Utils( createErrorHandlerChain() );
			var oHPCCCluster = new pHpccClusterClass( createErrorHandlerChain(), oUtils );
			
			// Mods
			register_mod( oHPCCCluster, './mods/configmgr', logger, oUtils, SSH );
			register_mod( oHPCCCluster, './mods/create', logger, oUtils, CF, S3, oSSM );
			register_mod( oHPCCCluster, './mods/destroy', logger, oUtils );
			register_mod( oHPCCCluster, './mods/ecl_watch', logger, oUtils );
			register_mod( oHPCCCluster, './mods/estimate', logger, oUtils, CF, EC2 );
			register_mod( oHPCCCluster, './mods/halt', logger, oUtils, CF, EC2 );
			register_mod( oHPCCCluster, './mods/hpcc_init', logger, oUtils, SSH );
			register_mod( oHPCCCluster, './mods/init', logger, oUtils );
			register_mod( oHPCCCluster, './mods/resume', logger, oUtils, CF, EC2 );
			register_mod( oHPCCCluster, './mods/run', logger, oUtils, SSH );
			register_mod( oHPCCCluster, './mods/scp', logger, oUtils );
			register_mod( oHPCCCluster, './mods/ssh', logger, oUtils, SSH );
			register_mod( oHPCCCluster, './mods/status', logger, oUtils, SSH );
			register_mod( oHPCCCluster, './mods/validate', logger, oUtils, CF );
			
			/*
			var ExecutorClass = function() {
				var that = this;
				this.mEmits = setInterval(function() {
					console.log('==============================> emitting close2!');
					if ( that['emit'] ) that['emit']('close', 0, 0);
				}, 5);
				
			}
			ExecutorClass.prototype.exec = function( pCmd, pCmdArgs, pCmdOpts ) {
				winston.log('info', 'exec(%s,%s,%s)...', pCmd, pCmdArgs, pCmdOpts );
				return { 
					on: function( pEvent, pCallback ) {
						pCallback( 0, 0 );
					}
				}
			}
			util.inherits(ExecutorClass, EventEmitter);

			register_mod( oHPCCCluster, './mods/etl', oUtils, new ExecutorClass() );
			*/
			//return null;
			//var oFunction = ( typeof( pFunction ) == 'string' ) ? oHPCCCluster[pFunction] : pFunction;
			//console.log('Function=');
			//console.dir( oFunction );
			//this._closure( oFunction.apply( oHPCCCluster, pArguments ) );
			//this._closure( oFunction( pArguments ) );
			this._closure( oHPCCCluster[pFunction].apply(oHPCCCluster, pArguments ));
		} catch ( e ) {
			console.error( e );
		}
	},
	init: function( pHpccClusterClass, args ) {
		var that = this;
		
		winston.configure({
			level: 'info',
			transports: [
			             new (winston.transports.File)({ filename: 'hpcc-cluster.log', handleExceptions: true, humanReadableUnhandledException: true })
		    ]
		});
		
		
		program
			.version('1.0.2')
			.description('For manual, use man hpcc-cluster')
			.option('-d, --debug', 'Specify log level')
			.option('-p, --profile <profile>', 'Specify AWS Configuration Profile to use.', 'hpcc-cluster')
			.option('-r, --region <region>', 'Specify AWS region to use', 'us-east-1');
		
		program
			.command('init')
			.description('Initialize cluster configuration.')
			.option("-f, --force", "Force initilization even if existing configuration exists.", false)
			.action(function(options){
				options.force = options.force || false;
				console.log('pHpccClusterClass=' + pHpccClusterClass);
				that._run_command( pHpccClusterClass, "init", [ null, options ] );
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.init( CONFIG_FILE_PATH, options ) );
			});
		
		program
		.command('etl <filename>')
		.description('ETL file(s)')
		.action(function(filename, options){
			options.filename = options.filename || filename;
			
			that._run_command( pHpccClusterClass, 'etl', [ oClusterConfig, options ] );
			//winston.level = options.parent.debug;
			//closure( oHPCCCluster.init( CONFIG_FILE_PATH, options ) );
		});
		
		program
			.command('up')
			.alias('create')
			//.alias('update')
			.description('Create new cluster or Update existing cluster based on configuration.')
			.action(function(options){
				that._run_command( pHpccClusterClass, "create", [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.create( oClusterConfig, options ) );
			});
		
		program
			.command('validate')
			.description('Validate template using cluster configuration. This is mostly for debugging purposes when updating the cluster template/configuration.')
			.action(function(options){
				that._run_command( pHpccClusterClass, "validate", [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.create( oClusterConfig, options ) );
			});
		
		program
			.command('resume')
			//.alias('start')
			.description('Resume cluster previously halted.')
			.action(function(options){
				that._run_command( pHpccClusterClass, "resume", [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.resume( oClusterConfig, options ) );
			});
		
		program
			.command('halt')
			//.alias('stop')
			.description('Halt current cluster. Cluster can be resumed thereafter.')
			.action(function(options){
				that._run_command( pHpccClusterClass, "halt", [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.halt( oClusterConfig, options ) );
			});
		
		program
			.command('destroy')
			.alias('terminate')
			.description('Destroy current cluster. Cluster CAN NOT be stopped nor resumed thereafter.')
			.action(function(options){
				that._run_command( pHpccClusterClass, "destroy", [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.destroy( oClusterConfig, options ) );
			});
		
		program
			.command('status')
			.description('Display status of current cluster.')
			.action(function(options){
				that._run_command( pHpccClusterClass, "status", [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.status( oClusterConfig, options ) );
			});
		
		program
			.command('help')
			.description('Display help.')
			.action(function(options){
				program.help();
			});
		
		/*
		program
			.command('list')
			.description('List resources of current cluster. (NOT IMPLEMENTED)')
			.action(function(options){
				that._run_command( pHpccClusterClass, pHpccClusterClass.prototype.list, [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.list( oClusterConfig, options ) );
			});
		*/
		
		program
			.command('push')
			.description('Push local file to cluster (NOT IMPLEMENTED)')
			.option("-s, --source <file>", "Local file to push to cluster node.")
			.option("-t, --target <path>", "Path to push local file to.")
			.option("--ip <ip_address>", "Ip address of node in cluster. If omitted, Master will be used.")
			.action(function(options){
				//winston.level = options.parent.debug;
				console.error('TODO!');
			});
		
		program
			.command('estimate')
			.description('Estimate the costs of your current configuration.')
			.action(function(options){
				that._run_command( pHpccClusterClass, "estimate", [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.ssh( oClusterConfig, options ) );
			});
		
		program
			.command('eclwatch')
			.description('Open ECL Watch page.')
			.action(function(options){
				that._run_command( pHpccClusterClass, "ecl_watch", [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.ssh( oClusterConfig, options ) );
			});
		
		program
			.command('run <target> <cmd>')
			.description('Run command in target(s). Example: run slave* "sudo resize2fs /dev/xvdf".')
			.option("--pty", "Allocate pty. Useful for use of nohup and &.")
			.action(function(target, cmd, options){
				options['target'] = target;
				options['cmd'] = cmd;
				options.pty = options['pty'] || false;
				that._run_command( pHpccClusterClass, "run", [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.ssh( oClusterConfig, options ) );
			});
		
		
		program
			.command('hpcc-init <cmd> [ip_or_node]')
			.description('HPCC Cluster itself. Possible commands: start, stop, restart, status, stopAll (stops dafilesrv as well) and update which stops cluster, copy source/environment.xml file and push to all cluster.')
			//.option("--ip <ip_address>", "Public IP Address of master node.")
			.action(function(cmd, ip_or_node, options){
				options['cmd'] = cmd;
				options['target'] = ip_or_node;
				that._run_command( pHpccClusterClass, "hpcc_init", [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.ssh( oClusterConfig, options ) );
			});
		
		program
			.command('configmgr [ip_or_node]')
			.description('Start/Stop HPCC Config Manager')
			//.option("--ip <ip_address>", "Public IP Address of master node.")
			.action(function(ip_or_node, options){
				options['target'] = ip_or_node;
				that._run_command( pHpccClusterClass, "configmgr", [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.ssh( oClusterConfig, options ) );
			});
		
		program
			.command('ssh [ip_or_node]')
			.description('SSH into node of current cluster')
			//.option("--ip <ip_address>", "Public IP Address of node from current cluster.")
			.action(function(ip_or_node, options){
				options['target'] = ip_or_node;
				that._run_command( pHpccClusterClass, "ssh", [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.ssh( oClusterConfig, options ) );
			});
		
		program
			.command('scp <source> <target>')
			.description('SCP files from/to node. Just prefix remote with ":", like "scp local_file.txt @1.2.3.4:/tmp/remote_file.txt". User will be injected automatically.')
			//.option("--ip <ip_address>", "Public IP Address of node from current cluster.")
			.action(function(source, target, options){
				options['target'] = target;
				options['source'] = source;
				that._run_command( pHpccClusterClass, "scp", [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.ssh( oClusterConfig, options ) );
			});
			
		program
			.command('test')
			.description('Test')
			//.option("--ip <ip_address>", "Public IP Address of node from current cluster.")
			.action(function(options){
				that._run_command( pHpccClusterClass, "test", [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.ssh( oClusterConfig, options ) );
			});
		
		program.parse( process.argv );
		
		if (!program.args.length) {
			program.help();
			return;
		}
	}
}
