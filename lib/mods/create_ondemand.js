const Fs = require('fs');
const path = require('path');
const Promises = require('../promises');

const VelocityEngine = require('velocity').Engine;
const { yamlParse, yamlDump } = require('yaml-cfn');
const Addr = require('netaddr').Addr;
const sync_request = require('sync-request');

const DEFAULT_SETTINGS = {
	TemplateMacros: path.resolve(__dirname, "templates/macros.vm"),
	TemplateCluster: path.resolve(__dirname, "templates/cluster.template.yaml"),
	TemplateClusterNode: path.resolve(__dirname, "templates/node.template.yaml"),
	WorkDir: path.resolve(process.cwd(), ".hpcc-cluster/")
}

ModClass = function( pHpccCluster, pLogger, pUtils, pCloudClient, pSettings) {
	//pHpccCluster.mod( 'create', this, this.handle_create );
	//pHpccCluster.mod( 'create_cloudformation_templates', this, this.handle_create_cloudformation_templates );
	//pHpccCluster.mod( 'estimate', this, this.handle_estimate );
	this.mLogger = pLogger;
	this.mRoot = pHpccCluster;
	this.mCloudClient = pCloudClient;
	this.mUtils = pUtils;
	this.mSettings = pSettings || DEFAULT_SETTINGS;
	this._init();
}

ModClass.prototype._init = function() {
	var that = this;
	var oTemplateFile = that.mSettings.TemplateClusterNode;
	var oTemplateMacrosFile = that.mSettings.TemplateMacros;
	this.mTemplate = Fs.readFileSync( oTemplateFile, {encoding: 'utf8'} );
	this.mTemplateMacros = Fs.readFileSync( oTemplateMacrosFile, {encoding: 'utf8'} );	
}

ModClass.prototype._sync_request = function( pHttpMethod, pUrl ) {
	return sync_request(pHttpMethod, pUrl);
};

ModClass.prototype._injectConfigSets = function( pConfig, pTemplate, pTemplateEngine ) {
	var oTemplate = typeof( pTemplate ) === 'string' ? yamlParse( pTemplate ) : pTemplate;
	if ( pConfig["Node"]["ConfigSets"] ) {
		try {
			for (var i in pConfig["Node"]["ConfigSets"] ) {
				var oConfigSetEntry = pConfig["Node"]["ConfigSets"][ i ];
				try {
					var oConfigSet = null;
					if ( typeof( oConfigSetEntry ) === 'string' ) {
						// Load yaml
						//console.log('Requesting "' + oConfigSetEntry + '"...');
						var res = this._sync_request('GET', oConfigSetEntry);
						var oBody = res.getBody('utf8');
						//console.log('Body:');
						//console.log( oBody );
						var oVEngine = new VelocityEngine( { template: oBody, macro: this.mTemplateMacros } );
						var oRendered = oVEngine.render( pConfig );
						oConfigSet = yamlParse( oRendered );
						//console.log('ConfigSet(YAML):');
						//console.log( oConfigSet );
						/*), function( err, response, body) {
							console.log('Body = ');
							console.log(body);
							var oRendered = pTemplateEngine.render( pConfig, body);
							oConfigSet = yamlParse( oRendered );
						});
						*/
						/*
							.on('response', function(response) {
								//console.log('Response:');
								//console.log(response);
							})
							.on('data', function(data) {
								console.log('Data:');
								console.log(data);
							})
							.on('error', function(error) {
								console.error('Error while processing configset ' + i + '.');
							});
						*/
						//console.log('Response from "' + oConfigSetEntry + '"...');
						/*
						, function (error, response, body) {
							console.log('error:', error); // Print the error if one occurred
							console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
							console.log('body:', body); // Print the HTML for the Google homepage.
							var oRendered = pTemplateEngine.render( pConfig, body);
							oConfigSet = yamlParse( oRendered );
						});
						*/
					} else if ( typeof( oConfigSetEntry ) === 'object' ) {
						// Load as is
						//oConfigSet = yamlParse( oConfigSetEntry );
						oConfigSet = oConfigSetEntry;
					}
					
					if ( ! oTemplate.Resources.HPCCCluster.Metadata["AWS::CloudFormation::Init"] ) oTemplate.Resources.HPCCCluster.Metadata["AWS::CloudFormation::Init"] = {};
					oTemplate.Resources.HPCCCluster.Metadata["AWS::CloudFormation::Init"][i] = {};
					
					for (var j in oConfigSet) {
						oTemplate.Resources.HPCCCluster.Metadata["AWS::CloudFormation::Init"][ i ][ j ] = oConfigSet[ j ];
					}
					//for (var l in pConfig["Node"]["ConfigSets"] ) {
					//	oTemplate.Resources.HPCCCluster.Metadata["AWS::CloudFormation::Init"][  ][ l ] = pConfig["Node"]["ConfigSets"][ k ][ l ];
					//}
				} catch (e2) {
					console.error('Error while processing configset ' + i + '.', e2);
					this.mLogger.error( e2 );
					throw e2;
				}
			}
		} catch (e) {
			this.mLogger.error( e );
			throw e;
		}
	}
	return yamlDump( oTemplate );
};


ModClass.prototype.create_cluster_node_cloudformation_templates = function( pConfig , pParameters ) {
	var oVEngine = new VelocityEngine( { template: this.mTemplate, macro: this.mTemplateMacros } );
	
	// Load all ConfigSets
	
	// Basically make a copy of pConfig (as to not alter it)
	var oBasicTemplateVars = this.mUtils.merge_new_only( pConfig, {} );
	
	var oDefaultInstanceSetup = pConfig.Instance;
	
	// Master
	var oMasterInstance = this.mUtils.merge_new_only( pConfig.MasterInstance, {} );
	this.mUtils.merge_new_only( oDefaultInstanceSetup, oMasterInstance );
	var oTemplateVars = this.mUtils.merge_new_only( oBasicTemplateVars, { Node: oMasterInstance } );
	
	var oMasterClusterNodeTemplate = oVEngine.render( oTemplateVars );
	oMasterClusterNodeTemplate = this._injectConfigSets( oTemplateVars, oMasterClusterNodeTemplate );
	
	// Support
	var oSupportInstance = this.mUtils.merge_new_only( pConfig.SupportInstance, {} );
	this.mUtils.merge_new_only( oDefaultInstanceSetup, oSupportInstance );
	
	oTemplateVars = this.mUtils.merge_new_only( oBasicTemplateVars, { Node: oSupportInstance } );
	var oSupportClusterNodeTemplate = oVEngine.render( oTemplateVars );
	oSupportClusterNodeTemplate = this._injectConfigSets( oTemplateVars, oSupportClusterNodeTemplate );
	
	// Slave
	var oSlaveInstance = this.mUtils.merge_new_only( pConfig.SlaveInstance, {} );
	this.mUtils.merge_new_only( oDefaultInstanceSetup, oSlaveInstance );
	
	oTemplateVars = this.mUtils.merge_new_only( oBasicTemplateVars, { Node: oSlaveInstance } );
	var oSlaveClusterNodeTemplate = oVEngine.render( oTemplateVars );
	oSlaveClusterNodeTemplate = this._injectConfigSets( oTemplateVars, oSlaveClusterNodeTemplate );
	
	return {
		SupportNodeTemplate: oSupportClusterNodeTemplate,
		SlaveNodeTemplate: oSlaveClusterNodeTemplate,
		MasterNodeTemplate: oMasterClusterNodeTemplate
	};
	
};

ModClass.prototype.create_node_template_s3_key = function( pConfig, pNodeType ) {
	return 'clusters/' + pConfig.AWS.Username + '/' + pConfig.Cluster.Name + '/' + pNodeType.toLowerCase() + '.template';
};

ModClass.prototype.create_node_template_https_url = function( pConfig, pNodeType ) {
	return 'https://s3.amazonaws.com/' + pConfig.AWS.S3Bucket + '/' + this.create_node_template_s3_key( pConfig, pNodeType );
};

ModClass.prototype.create_cluster_cloudformation_template = function( pConfig , pParameters ) {
	var oDefaultInstanceSetup = pConfig.Instance;
	
	var oMasterInstance = this.mUtils.merge_new_only( pConfig.MasterInstance, {} );
	this.mUtils.merge_new_only( oDefaultInstanceSetup, oMasterInstance );
	
	var oMasterAddr = Addr( pConfig.Vpc.CidrBlock );
	
	oMasterInstance.TemplateURL = this.create_node_template_https_url( pConfig, 'Master' );
	oMasterInstance.NodeId = "";
	oMasterInstance.NodeType = "master";
	oMasterInstance.PrivateIpAddress = this.mUtils.getAddrIP( oMasterAddr );
	var oTemplateVars = {
			clusterName: pConfig.Cluster.Name,
			nodes: [ oMasterInstance ]
	}
	
	var oAddr = oMasterAddr.increment();
	for ( var i = 0; i < pConfig.Cluster.Supports; i++ ) {
		var oSupportInstance = this.mUtils.merge_new_only( pConfig.SupportInstance, {} );
		this.mUtils.merge_new_only( oDefaultInstanceSetup, oSupportInstance );
		oSupportInstance.TemplateURL = this.create_node_template_https_url( pConfig, 'Support' );
		oSupportInstance.NodeId = this.mUtils.pad(i,3);
		oSupportInstance.NodeType = "support";
		oSupportInstance.PrivateIpAddress = this.mUtils.getAddrIP( oAddr );
		
		oTemplateVars.nodes.push( oSupportInstance );
		oAddr = oAddr.increment();
	}
	for ( var i = 0; i < pConfig.Cluster.Slaves; i++ ) {
		var oSlaveInstance = this.mUtils.merge_new_only( pConfig.SlaveInstance, {} );
		this.mUtils.merge_new_only( oDefaultInstanceSetup, oSlaveInstance );
		oSlaveInstance.TemplateURL = this.create_node_template_https_url( pConfig, 'Slave' );
		oSlaveInstance.NodeId = this.mUtils.pad(i,3);
		oSlaveInstance.NodeType = "slave";
		oSlaveInstance.PrivateIpAddress = this.mUtils.getAddrIP( oAddr );
		oTemplateVars.nodes.push( oSlaveInstance );
		oAddr = oAddr.increment();
	}
	
	var oTemplate = Fs.readFileSync( this.mSettings.TemplateCluster, {encoding: 'utf8'} );
	var oVEngine = new VelocityEngine( { template: oTemplate } );
	var oClusterTemplate = oVEngine.render( oTemplateVars );
	
	return oClusterTemplate;
};

ModClass.prototype.handle_estimate = function( pConfig, pParameters ) {
	var that = this;
	return new Promise( function( resolve, reject ) {
		try {
			//WARNING: depends on another mod!
			that.handle_create_cloudformation_templates( pConfig, pParameters ).then( function( pClusterTemplate ) {
				var oBaseParameters = [
		     		{
		     			"ParameterKey": "ParamSubnetId",
		     			"ParameterValue": pConfig.Vpc.SubnetId
		     		},
		     		{
		     			"ParameterKey": "ParamSecurityGroupId",
		     			"ParameterValue": pConfig.Vpc.SecurityGroupId
		     		}
		     	];
		     	var oParams = {
		     		TemplateBody: pClusterTemplate,
		     		Parameters: oBaseParameters
		     	};
		     	that.mCloudClient.estimate_template_cost( oParams ).then( function( pData ) {
					console.log( pData );
					resolve( 'Ok!');
				}, function( pError ) {
					reject( pError );
				});
			}, function( pError ) {
				reject( pError );
			});
		
		} catch (e) {
			reject(e);
		}
	});
};

// Returns the master template
ModClass.prototype.handle_create_cloudformation_templates = function( pConfig, pParameters ) {
	var that = this;
	var oTargetDir = this.mSettings.WorkDir || pParameters.WorkDir || process.cwd();
	if ( ! Fs.existsSync( oTargetDir ) ) {
		Fs.mkdirSync( oTargetDir );
	}
	var oSupportTemplateFilename = path.resolve( oTargetDir, '_generated_support_template.yaml');
	var oMasterTemplateFilename = path.resolve( oTargetDir, '_generated_master_template.yaml');
	var oSlaveTemplateFilename = path.resolve( oTargetDir, '_generated_slave_template.yaml');
	var oClusterTemplateFilename = path.resolve( oTargetDir, '_generated_cluster_template.yaml');
	
	var oNodeTemplates = this.create_cluster_node_cloudformation_templates( pConfig, pParameters );
	
	var oClusterTemplate = this.create_cluster_cloudformation_template( pConfig, pParameters );
	
	// Write templates to files
	Fs.writeFileSync( oSupportTemplateFilename, oNodeTemplates.SupportNodeTemplate, {encoding: 'utf8'} );
	Fs.writeFileSync( oMasterTemplateFilename, oNodeTemplates.MasterNodeTemplate, {encoding: 'utf8'} );
	Fs.writeFileSync( oSlaveTemplateFilename, oNodeTemplates.SlaveNodeTemplate, {encoding: 'utf8'} );
	
	// Just to check
	Fs.writeFileSync( oClusterTemplateFilename, oClusterTemplate, {encoding: 'utf8'} );
	
	return new Promise( function( resolve, reject ) {
		if( pConfig.DryRun ) {
			console.log('DryRun mode. Templates generated locally but not uploaded to S3.');
			that.mLogger.info("NB: DryRun mode. Templates generated locally but not uploaded to S3.");
			resolve( oClusterTemplate );
		} else {
			// Upload to S3
			that.mLogger.debug('Uploading templates to S3...');
			var create_s3_params = function( pTemplateFilename, pNodeType ) {
				return {
						Body: Fs.createReadStream( pTemplateFilename ),
						Bucket: pConfig.AWS.S3Bucket, 
						Key: that.create_node_template_s3_key( pConfig, pNodeType ), 
						ServerSideEncryption: "AES256"
						//Tagging: "key1=value1&key2=value2"
				};
			}
			
			var oSupportNodeTemplateUpload = function() { that.mCloudClient.s3_upload_file( create_s3_params( oSupportTemplateFilename, 'support' ) ) };
			var oMasterNodeTemplateUpload = function() { that.mCloudClient.s3_upload_file( create_s3_params( oMasterTemplateFilename, 'master' ) ) };
			var oSlaveNodeTemplateUpload = function() { that.mCloudClient.s3_upload_file( create_s3_params( oSlaveTemplateFilename, 'slave' ) ) };
			
			Promises.seq( [ oMasterNodeTemplateUpload, oSupportNodeTemplateUpload, oSlaveNodeTemplateUpload ], {} ).then( function( pResults ) {
				console.log( 'Templates successfully uploaded.' );
				resolve( oClusterTemplate );
			}, function( err ) {
				that.mLogger.error('Error uploading cluster templates. See logs for details.', err);
				reject( err );
			});
		}
		
	});	
};

ModClass.prototype.handle_create = function( pConfig, pParameters ) {
	var that = this;
	if ( pConfig.Email === 'youremail@yourorg.com' || pConfig.Email === ''  ) {
		throw new Error("You must provide your email address in cluster.config file.");
	}
	return new Promise( function( resolve, reject ) {
		var oTemplateCreation = function() {
			return that.handle_create_cloudformation_templates( pConfig, pParameters );
		};
		var oClusterPreparation = function( clusterTemplate ) {
			return new Promise( function( resolve, reject ) {
				that.mCloudClient.secure_storage_setup( { Name: '/hpcc-clusters/' + pConfig.AWS.Username + '/' + pConfig.Cluster.Name + '/luks' } ).then(
					function( pData ) {
						resolve( clusterTemplate ); // pass-through
					}, function( pError ) {
						//that.mRoot.handle_error( pError, oPromise );
						reject( pError );
				});
			});
		}
		var oClusterFormation = function( clusterTemplate ) {
			var oBaseParameters = [
	      		{
	      			"ParameterKey": "ParamSubnetId",
	      			"ParameterValue": pConfig.Vpc.SubnetId
	      		},
	      		{
	      			"ParameterKey": "ParamSecurityGroupId",
	      			"ParameterValue": pConfig.Vpc.SecurityGroupId
	      		}
	      	];
	      	var oParams = {
	      		StackName: pConfig.Cluster.Name,
	      		TemplateBody: clusterTemplate,
	      		Parameters: oBaseParameters,
	      		Tags: [ { Key: 'Email', Value: pConfig.Email }, { Key: 'User', Value: '${aws:username}' } ]
	      	};
			that.mLogger.debug('Creating stack with parameters:', oParams);
			that.mLogger.debug(oParams);
			
	      	return that.mCloudClient.create_stack_to_completion( oParams );
		};
		var oRefreshState = function( pData ) {
			return new Promise( function( resolve, reject ) {
				var ret = function() {
					that.mLogger.info('successfully created cluster %s.', pConfig.Cluster.Name);
		  			//try {
		  			//	console.log('Master Public IP = ' + pData.Stakcs[0].Outputs.MasterPublicIP)
		  			//} catch (e) {}
					resolve( pData );
				}
				that.mRoot.refresh_state( pConfig ).then( ret, ret ); // refresh state, ignore error when saving state
			});
		}
		
		var oSequence = [];
		if ( pConfig.DryRun ) {
			console.log("DryRun mode. Won't actually create stack.");
			that.mLogger.info("NB: DryRun mode. Won't actually create stack.");
			oSequence = [ oTemplateCreation ];
		} else {
			oSequence = [ oTemplateCreation, oClusterPreparation, oClusterFormation , oRefreshState ];
		}; 
		Promises.seq( oSequence, {} ).then( function( pData ) {
			resolve( pData );
		},  function( pError ) {
			that.mLogger.error( pError );
			reject( pError );
		} );
	} );
};

exports = module.exports = ModClass;
