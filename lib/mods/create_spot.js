


CreateSpotMod = function( pHpccCluster, pLogger, pUtils, pAWSCloudFormationClient, pAWSSSMClient, pAWSS3Client ) {
	this.mRoot = pHpccCluster;
	this.mUtils = pUtils;
	this.mLogger = pLogger;
	this.mCloudFormationClient = pAWSCloudFormationClient;
	this.mSSMClient = pAWSSSMClient;
	this.mS3Client = pAWSS3Client;
}

CreateSpotMod.prototype.create = function( pConfig, pParameters ) {
	
}

CreateSpotMod.prototype.create_cluster_node_cloudformation_templates = function( pConfig , pParameters ) {
	var that = this;
	var oTemplateFile = __dirname + '/' + this.mRoot.mInternalConfig.Templates.TemplateClusterNode;
	var oTemplateMacrosFile = __dirname + '/' + this.mRoot.mInternalConfig.Templates.TemplateMacros;
	var oTemplate = Fs.readFileSync( oTemplateFile, {encoding: 'utf8'} );
	var oTemplateMacros = Fs.readFileSync( oTemplateMacrosFile, {encoding: 'utf8'} );
	var oVEngine = new VelocityEngine( { template: oTemplate, macro: oTemplateMacros } );
	
	// Load all ConfigSets
	
	/*
	var injectConfigSet = function( pConfig, pTemplate ) {
		//var oTemplate = yaml.safeLoad( pTemplate );
		var oTemplate = yamlParse( pTemplate );
		if ( pConfig["Node"]["ConfigSets"] ) {
			try {
				//oTemplate.Resources.HPCCNodeEc2Instance.Metadata["AWS::CloudFormation::Init"]["PreConfigSet"] = {};
				for (var k in pConfig["Node"]["ConfigSets"] ) {
					console.log('ConfigSet:');
					console.log(k);
					oTemplate.Resources.HPCCNodeEc2Instance.Metadata["AWS::CloudFormation::Init"][k] = {};
					for (var l in pConfig["Node"]["ConfigSets"] ) {
						oTemplate.Resources.HPCCNodeEc2Instance.Metadata["AWS::CloudFormation::Init"][ k ][ l ] = pConfig["Node"]["ConfigSets"][ k ][ l ];
					}
				}
			} catch (e) {
				that._handle_error( e );
			}
		}
		//return yaml.safeDump(oTemplate);
		return yamlDump( oTemplate );
	}
	*/
	var injectConfigSets = function( pConfig, pTemplate, pTemplateEngine ) {
		var oTemplate = yamlParse( pTemplate );
		if ( pConfig["Node"]["ConfigSets"] ) {
			try {
				//oTemplate.Resources.HPCCNodeEc2Instance.Metadata["AWS::CloudFormation::Init"]["PreConfigSet"] = {};
				for (var i in pConfig["Node"]["ConfigSets"] ) {
					var oConfigSetEntry = pConfig["Node"]["ConfigSets"][ i ];
					try {
						var oConfigSet = null;
						if ( typeof( oConfigSetEntry ) === 'string' ) {
							// Load yaml
							//console.log('Requesting "' + oConfigSetEntry + '"...');
							var res = sync_request('GET', oConfigSetEntry);
							var oBody = res.getBody('utf8');
							//console.log('Body:');
							//console.log( oBody );
							var oVEngine = new VelocityEngine( { template: oBody, macro: oTemplateMacros } );
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
					
						//console.log('ConfigSet for "' + oConfigSetEntry + '":');
						//console.log(oConfigSet);
						oTemplate.Resources.HPCCNodeEc2Instance.Metadata["AWS::CloudFormation::Init"][i] = {};
						for (var j in oConfigSet) {
							//console.log('...Working on ' + j);
							oTemplate.Resources.HPCCNodeEc2Instance.Metadata["AWS::CloudFormation::Init"][ i ][ j ] = oConfigSet[ j ];
						}
						//for (var l in pConfig["Node"]["ConfigSets"] ) {
						//	oTemplate.Resources.HPCCNodeEc2Instance.Metadata["AWS::CloudFormation::Init"][  ][ l ] = pConfig["Node"]["ConfigSets"][ k ][ l ];
						//}
					} catch (e2) {
						console.error('Error while processing configset ' + i + '.', e2);	
					}
				}
			} catch (e) {
				that._handle_error( e );
			}
		}
		//return yaml.safeDump(oTemplate);
		return yamlDump( oTemplate );
		//oPromise.resolve( yamlDump( oTemplate ) );
		
	}
	
	// Basically make a copy of pConfig (as to not alter it)
	var oBasicTemplateVars = this.mUtils.merge_new_only( pConfig, {} );
	
	var oDefaultInstanceSetup = pConfig.Instance;
	
	// Master
	var oMasterInstance = this.mUtils.merge_new_only( pConfig.MasterInstance, {} );
	this.mUtils.merge_new_only( oDefaultInstanceSetup, oMasterInstance );
	var oTemplateVars = this.mUtils.merge_new_only( oBasicTemplateVars, { Node: oMasterInstance } );
	
	var oMasterClusterNodeTemplate = oVEngine.render( oTemplateVars );
	//console.dir( oTemplateVars );
	//console.log("Master template:");
	//console.log( oMasterClusterNodeTemplate );
	oMasterClusterNodeTemplate = injectConfigSets( oTemplateVars, oMasterClusterNodeTemplate );
	//console.log("Master template (injected):");
	//console.log( oMasterClusterNodeTemplate );
	
	
	// Support
	var oSupportInstance = this.mUtils.merge_new_only( pConfig.SupportInstance, {} );
	this.mUtils.merge_new_only( oDefaultInstanceSetup, oSupportInstance );
	
	oTemplateVars = this.mUtils.merge_new_only( oBasicTemplateVars, { Node: oSupportInstance } );
	var oSupportClusterNodeTemplate = oVEngine.render( oTemplateVars );
	oSupportClusterNodeTemplate = injectConfigSets( oTemplateVars, oSupportClusterNodeTemplate );
	
	// Slave
	var oSlaveInstance = this.mUtils.merge_new_only( pConfig.SlaveInstance, {} );
	this.mUtils.merge_new_only( oDefaultInstanceSetup, oSlaveInstance );
	
	oTemplateVars = this.mUtils.merge_new_only( oBasicTemplateVars, { Node: oSlaveInstance } );
	var oSlaveClusterNodeTemplate = oVEngine.render( oTemplateVars );
	oSlaveClusterNodeTemplate = injectConfigSets( oTemplateVars, oSlaveClusterNodeTemplate );
	
	return {
		SupportNodeTemplate: oSupportClusterNodeTemplate,
		SlaveNodeTemplate: oSlaveClusterNodeTemplate,
		MasterNodeTemplate: oMasterClusterNodeTemplate
	};
	
};

CreateSpotMod.prototype.create_node_template_s3_key = function( pConfig, pNodeType ) {
	//return 'clusters/' + pConfig.AWS.Username + '/' + pConfig.Cluster.Name + '-' + pNodeType.toLowerCase() + '.template';
	return 'clusters/' + pConfig.AWS.Username + '/' + pConfig.Cluster.Name + '/' + pNodeType.toLowerCase() + '.template';
};

CreateSpotMod.prototype.create_node_template_https_url = function( pConfig, pNodeType ) {
	return 'https://s3.amazonaws.com/' + pConfig.AWS.S3Bucket + '/' + this.create_node_template_s3_key( pConfig, pNodeType );
};

CreateSpotMod.prototype.create_cluster_cloudformation_template = function( pConfig , pParameters ) {
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
	
	oAddr = oMasterAddr.increment();
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
	
	var oTemplate = Fs.readFileSync( __dirname + '/' + this.mRoot.mInternalConfig.Templates.TemplateCluster, {encoding: 'utf8'} );
	var oVEngine = new VelocityEngine( { template: oTemplate } );
	var oClusterTemplate = oVEngine.render( oTemplateVars );
	
	return oClusterTemplate;
};

// Returns the master template
CreateSpotMod.prototype.create_cloudformation_templates = function( pConfig, pParameters ) {
	var that = this;
	var oSupportTemplateFilename = this.mRoot.mInternalConfig.LocalDir + '/_generated_support_template.yaml';
	var oMasterTemplateFilename = this.mRoot.mInternalConfig.LocalDir + '/_generated_master_template.yaml';
	var oSlaveTemplateFilename = this.mRoot.mInternalConfig.LocalDir + '/_generated_slave_template.yaml';
	var oClusterTemplateFilename = this.mRoot.mInternalConfig.LocalDir + '/_generated_cluster_template.yaml';
	
	var oNodeTemplates = this.create_cluster_node_cloudformation_templates( pConfig, pParameters );
	
	var oClusterTemplate = this.create_cluster_cloudformation_template( pConfig, pParameters );
	
	// Write templates to files
	Fs.writeFileSync( oSupportTemplateFilename, oNodeTemplates.SupportNodeTemplate, {encoding: 'utf8'} );
	Fs.writeFileSync( oMasterTemplateFilename, oNodeTemplates.MasterNodeTemplate, {encoding: 'utf8'} );
	Fs.writeFileSync( oSlaveTemplateFilename, oNodeTemplates.SlaveNodeTemplate, {encoding: 'utf8'} );
	
	// Just to check
	Fs.writeFileSync( oClusterTemplateFilename, oClusterTemplate, {encoding: 'utf8'} );
	
	var oPromise = new Promise();
	
	if( pConfig.DryRun ) {
		console.log('DryRun mode. Templates generated locally but not uploaded to S3.');
		winston.log('info', "NB: DryRun mode. Templates generated locally but not uploaded to S3.");
		oPromise.resolve( oClusterTemplate );
	} else {
		// Upload to S3
		winston.log('debug', 'Uploading templates to S3...');
		create_s3_params = function( pTemplateFilename, pNodeType ) {
			return {
					Body: Fs.createReadStream( pTemplateFilename ),
					Bucket: pConfig.AWS.S3Bucket, 
					Key: that.create_node_template_s3_key( pConfig, pNodeType ), 
					ServerSideEncryption: "AES256"
					//Tagging: "key1=value1&key2=value2"
			};
		}
		
		oSupportNodeTemplateUpload = this.mUtils.s3_upload_file( this.mS3Client, create_s3_params( oSupportTemplateFilename, 'support' ) );
		oMasterNodeTemplateUpload = this.mUtils.s3_upload_file( this.mS3Client, create_s3_params( oMasterTemplateFilename, 'master' ) );
		oSlaveNodeTemplateUpload = this.mUtils.s3_upload_file( this.mS3Client, create_s3_params( oSlaveTemplateFilename, 'slave' ) );
		
		PromiseAll( [ oMasterNodeTemplateUpload, oSupportNodeTemplateUpload, oSlaveNodeTemplateUpload ] ).then( function( pPromises ) {
			console.log( 'Templates successfully uploaded.' );
			oPromise.resolve( oClusterTemplate );
		}, function( err ) {
			console.log('Error uploading cluster templates. See logs for details.');
			that.mRoot._handle_error( err, oPromise );
			//winston.log('error', err );
			//oPromise.reject( err);
		});
	}
	
	return oPromise;	
};

CreateSpotMod.prototype.create = function( pConfig, pParameters ) {
	var that = this;
	if ( pConfig.Email === 'youremail@yourorg.com' || pConfig.Email === ''  ) {
		throw new Error("You must provide your email address in cluster.config file.");
	}
	//console.log("Creating nodes...");
	//console.log( "\t%j", mInternalConfig.Cluster );
	
	var oPromise = new Promise();
	
	var oTemplateCreation = function() {
		return that.create_cloudformation_templates( pConfig, pParameters );
	};
	var oClusterPreparation = function( clusterTemplate ) {
		var oPromise = new Promise();
		that.mUtils.secure_storage_setup( that.mSSMClient, { Name: '/hpcc-clusters/' + pConfig.AWS.Username + '/' + pConfig.Cluster.Name + '/luks' } ).then(
				function( pData ) {
					oPromise.resolve( clusterTemplate ); // pass-through
				}, function( pError ) {
					that.mRoot._handle_error( pError, oPromise );
				})
		return oPromise;
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
		winston.log('debug', 'Creating stack with parameters:', oParams);
		winston.log('debug', oParams);
		
      	return that.mUtils.create_stack_to_completion( that.mCloudFormationClient, oParams );
	};
	var oRefreshState = function( pData ) {
		var oPromise = new Promise();
		var ret = function() {
			winston.log('info', 'successfully created cluster %s.', pConfig.Cluster.Name);
  			//try {
  			//	console.log('Master Public IP = ' + pData.Stakcs[0].Outputs.MasterPublicIP)
  			//} catch (e) {}
			oPromise.resolve( pData );
		}
		that.mRoot._refresh_state( pConfig ).then( ret, ret ); // refresh state, ignore error when saving state
		return oPromise;
	}
	
	if ( pConfig.DryRun ) {
		oTemplateCreation.then( function( clusterTemplate ) {
			console.log("DryRun mode. Won't actually create stack.");
			winston.log('info', "NB: DryRun mode. Won't actually create stack.");
	  		oPromise.resolve( "done" );
		}, function( pError ) {
			that.mRoot._handle_error( pError, oPromise );
		});
	} else {
		
		var oSequence = [ oTemplateCreation, oClusterPreparation, oClusterFormation , oRefreshState ];
		PromiseSeq( oSequence ).then( function( pData ) {
			oPromise.resolve( pData );
		},  function( pError ) {
			that.mRoot._handle_error( pError, oPromise );
		} );
	};
	
	return oPromise;
};
