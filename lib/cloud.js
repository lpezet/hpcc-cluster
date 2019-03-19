
/*
 * pClients of the form:
{
	s3: new AWS.S3(),
	ec2: ...
	ssm: ...
}
*/
MyClass = function( pErrorHandler, pLogger, pClients ) {
	this.mErrorHandler = pErrorHandler;
	this.mLogger = pLogger;
	this.mClients = pClients;
}

//const getIP = require('external-ip')();
//const util = require('util');


Utils = function( pErrorHandler ) {
	this.mErrorHandler = pErrorHandler;
};

Utils.prototype._handle_error = function( pError, pPromise ) {
	this.mErrorHandler.doHandle( pError, pPromise );
};

MyClass.prototype._shuffle = function ( pString ) {
  var a = pString.split(""),
  n = a.length;

  for(var i = n - 1; i > 0; i--) {
  	var j = Math.floor(Math.random() * (i + 1));
  	var tmp = a[i];
  	a[i] = a[j];
  	a[j] = tmp;
  }
  return a.join("");
};

MyClass.prototype._random_string = function( pLength, pCodec ) {
	var oCodec = pCodec || "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz~!@#$%^&*()_+`-={}|[]<>?,./";
	var oSCodec = this._shuffle( oCodec );
  var randomstring = '';
  for (var i=0; i< pLength; i++) {
      var rnum = Math.floor(Math.random() * oCodec.length);
      randomstring += oSCodec.substring(rnum,rnum+1);
  }
  return randomstring;
};


MyClass.prototype.secure_storage_setup = function( pParams ) {
	var that = this;
	if (! that.mClients['ssm'] ) return Promise.reject('SSM (ssm) client must be passed to constructor.');
	var oParams = {
		Name: pParams.Name
	}
	var oGetCurrentParameter = function() {
		return new Promise( function( resolve, reject ) {
			that.mClients.ssm.getParameter( oParams, function(err, data) {
				if (err) {
					if ( err["code"] === "ParameterNotFound" ) {
						resolve( {} );
					} else {
						that._handle_error( err, reject );
					}
				} else {
					resolve( data );
				}
			} );
		});
	}
	var oProcessCurrentParameter = function( pData ) {
		return new Promise( function( resolve, reject ) {
			// if nothing
			if ( ! pData["Parameter"] ) {
				var oSecurePassword = that._random_string( 12 );
				var oParams = {
					Name: pParams.Name,
					Type: "SecureString",
					Value: oSecurePassword,
					Description: "For dm-crypt/Luks",
					Overwrite: false
				};
				that.mClients.ssm.putParameter( oParams, function( err, data ) {
					if (err) {
						that._handle_error( err, reject );
					} else {
						resolve( data );
					}
				});
			} else {
				// otherwise
				resolve();
			}
		});
	}
	var oSequence = [ oGetCurrentParameter, oProcessCurrentParameter ];
	return Promises.seq( oSequence, {} );
	/*
	PromiseSeq( oSequence ).then( function( pData ) {
		oPromise.resolve( pData );
	},  function( pError ) {
		that._handle_error( pError, oPromise );
	} );
	return oPromise;
	*/
}

MyClass.prototype.s3_upload_file = function( pParams ) {
	var that = this;
	if (! that.mClients['s3'] ) return Promise.reject('S3 (s3) client must be passed to constructor.');
	
	return new Promise( function( resolve, reject ) {
	var oParams = pParams;
		//pS3Client.putObject( oParams, function(err, data) {
		that.mClients.s3.upload( oParams, function(err, data) {
			if (err) {
				that._handle_error( err, reject );
				//winston.log('error',err);
				//oPromise.reject( err );
			} else {
				resolve( data );
			}
		 });
	});
};

MyClass.prototype.get_aws_user = function( pParams ) {
	var that = this;
	if (! that.mClients['iam'] ) return Promise.reject('IAM (iam) client must be passed to constructor.');
	return new Promise( function( resolve, reject ) {
		that.mClients.iam.getUser( pParams, function( err, data ) {
			if (error) {
				that._handle_error( error, reject );
				//winston.log('error',error);
				//oPromise.reject( error );
			} else {
				resolve( data );
			}
		});
	});
};

MyClass.prototype.validate_template = function( pParams ) {
	var that = this;
	if (! that.mClients['cf'] ) return Promise.reject('CloudFormation (cf) client must be passed to constructor.');
	return new Promise( function( resolve, reject ) {
		that.mClients.cf.validateTemplate( pParams, function(error, data) {
			if (error) {
				that._handle_error( error, reject );
				//winston.log('error',error);
				//oPromise.reject( error );
			} else {
				resolve( data );
			}
		});
	});
};

MyClass.prototype.create_stack = function( pParams ) {
	var that = this;
	if (! that.mClients['cf'] ) return Promise.reject('CloudFormation (cf) client must be passed to constructor.');
	return new Promise( function( resolve, reject ) {
		that.mClients.cf.createStack( pParams, function(error, data) {
			if (error) {
				that._handle_error( error, reject );
				//winston.log('error',error);
				//oPromise.reject( error );
			} else {
				// Not working?????
				//mOutput.Stacks.push( data.StackId );
				// -----------------
				resolve( data );
			}
		});
	});
};

MyClass.prototype.stop_instances_to_completion = function( pParams ) {
	var that = this;
	if (! that.mClients['ec2'] ) return Promise.reject('EC2 (ec2) client must be passed to constructor.');
	return new Promise( function( resolve, reject ) {
		//process.stdout.write
		console.log("\tStopping instances: " + pParams.InstanceIds);
		try {
			that.mClients.ec2.stopInstances( pParams, function(error, data) {
				if (error) {
					console.log("\tFAILED");
					that._handle_error( error, reject );
					//winston.log('error',error);
					//oPromise.reject( error );
				} else {
					console.log("\tOK (stopping).");
					console.log("\tWaiting for completion...");
					that.mClients.ec2.waitFor('instanceStopped', pParams, function(error2, data2) {
						if (error2) {
							console.log("\tFAILED to complete.");
							that._handle_error( error2, reject );
							//winston.log('error',error2);
							//oPromise.reject( error2 );
						} else {
							console.log("\tOK (stopped).");
							resolve( data2, data );
						}
					});
				}
			});
		} catch (error) {
			console.log("\tFAILED (2).");
			that._handle_error( error, reject );
			//winston.log('error',error);
			//oPromise.reject( error );
		}
	});
};

MyClass.prototype.start_instances_to_completion = function( pParams ) {
	var that = this;
	if (! that.mClients['ec2'] ) return Promise.reject('EC2 (ec2) client must be passed to constructor.');
	return new Promise( function( resolve, reject ) {
		console.log("\tStarting instances: " + pParams.InstanceIds);
		try {
			that.mClients.ec2.startInstances( pParams, function(error, data) {
				if (error) {
					console.log("\tFAILED");
					that._handle_error( error, reject );
					//winston.log('error',error);
					//oPromise.reject( error );
				} else {
					console.log("\tOK (starting).");
					console.log("\tWaiting for completion...");
					that.mClients.ec2.waitFor('instanceRunning', pParams, function(error2, data2) {
						if (error2) {
							console.log("\tFAILED to complete.");
							that._handle_error( error2, reject );
							//winston.log('error',error2);
							//oPromise.reject( error2 );
						} else {
							console.log("\tOK (running).");
							resolve( data2, data );
						}
					});
				}
			});
		} catch (error) {
			console.log("\tFAILED (2).");
			that._handle_error( error, reject );
			//winston.log('error',error);
			//oPromise.reject( error );
		}
	});
};

MyClass.prototype.create_stack_to_completion = function( pParams ) {
	var that = this;
	if (! that.mClients['cf'] ) return Promise.reject('CloudFormation (cf) client must be passed to constructor.');
	return new Promise( function( resolve, reject ) {
		var oCreateStackFunc = function() {
			//process.stdout.write
			console.log("\t[%s] Creating stack...",  pParams.StackName);
			try {
				that.mClients.cf.createStack( pParams, function(error, data) {
					if (error) {
						console.log("\t[%s] FAILED",  pParams.StackName);
						that._handle_error( error, reject );
						//winston.log('error',error);
						//oPromise.reject( error );
						
						//process.stdout.write("[FAILED]\n");
						// error handling code
						//console.log( "######### ERROR #########" );
						//console.log( error );
					} else {
						//process.stdout.write("[OK]\n");
						console.log("\t[%s] OK (initiated).",  pParams.StackName);
						var oParams = {
							StackName: data.StackId
						}
						console.log("\t[%s] Waiting for completion...",  pParams.StackName);
						//process.stdout.write("\tWaiting for completion...");
						that.mClients.cf.waitFor('stackCreateComplete', oParams, function(error2, data2) {
							if (error2) {
								that._handle_error( error2, reject );
								console.log("\t[%s] FAILED to complete.",  pParams.StackName);
								//winston.log('error',error2);
								//process.stdout.write("[FAILED]\n");
								//oPromise.reject( error2 );
							} else {
								//mOutput.Stacks.push( data.StackId );
								console.log("\t[%s] OK (completed).",  pParams.StackName);
								//process.stdout.write("[OK]\n");
								/*
								// Get outputs
								var oOutputs = data2.Stacks[0].Outputs;
								for (var i = 0; i < oOutputs.length; i++ ) {
									switch ( oOutputs[i].OutputKey ) {
										case "VpcId":
											mInternalConfig.VpcId = oOutputs[i].OutputValue;
											break;
										case "SecurityGroupId":
											mInternalConfig.SecurityGroupId = oOutputs[i].OutputValue;
											break;
										case "SubnetId":
											mInternalConfig.SubnetId = oOutputs[i].OutputValue;
											break;
									}
								}
								*/
								resolve( data2, data );
							}
						});
						// data handling code
						//console.log( data );
						//oPromise.resolve( data );
					}
				});
			} catch (error) {
				console.log("\t[%s] FAILED (2).",  pParams.StackName);
				that._handle_error( error, reject );
				//winston.log('error',error);
				//process.stdout.write("[FAILED](2)\n");
				//oPromise.reject( error );
			}
		};
		
		that.stack_exists( pParams.StackName ).then( function() {
			console.log('Stack ' + pParams.StackName + ' already exists. As of right now, template updates are not supported.');
			reject();
		}, oCreateStackFunc );
	});
};

MyClass.prototype.describe_instances = function( pParams ) {
	var that = this;
	if (! that.mClients['ec2'] ) return Promise.reject('EC2 (ec2) client must be passed to constructor.');
	return new Promise( function( resolve, reject ) {
		that.mEc2Client.describeInstances( oEc2Params, function( error, data ) {
			if ( error ) {
				reject( error );
			} else {
				resolve( data );
			}
		});
	});
}

MyClass.prototype.stack_exists = function( pStackId, pStackName ) {
	var that = this;
	if (! that.mClients['cf'] ) return Promise.reject('CloudFormation (cf) client must be passed to constructor.');
	return new Promise( function( resolve, reject ) {
		var oParams = {
			StackName: pStackId
		};
		that.mClients.cf.describeStacks( oParams, function( error, data ) {
			if ( error ) {
				if ( error.code === 'ValidationError' ) {
					console.log( 'Stack ' + (pStackName ? pStackName : pStackId)  + ' does not exist.');
					winston.log('debug', error);
					reject( error );
				} else {
					that._handle_error( error, reject );
					//winston.log('error', error);
				}
			} else {
				resolve( data );
			}
		});
	});
};

MyClass.prototype.get_sub_stacks = function( pStackId ) {
	var that = this;
	if (! that.mClients['cf'] ) return Promise.reject('CloudFormation (cf) client must be passed to constructor.');
	return new Promise( function( resolve, reject ) {
		var oParams = {
			StackName: pStackId
		};
		that.mClients.cf.listStackResources( oParams, function( error, data ) {
			try {
				if ( error ) {
					that._handle_error( error, reject );
					//winston.log('error', error);
					//oPromise.reject( error );
				} else {
					var oSubStacks = [];
					var oStackResources = data.StackResourceSummaries;
					for ( var i in oStackResources ) {
						var r = oStackResources[i];
						if ( r.ResourceType === 'AWS::CloudFormation::Stack' ) {
							oSubStacks.push( r );
						}
					}
					resolve( oSubStacks );
				}
			} catch ( e ) {
				that._handle_error( e, reject );
				//console.log( e );
			}
		});
	});
};

MyClass.prototype.get_all_ec2_instance_ids_from_cluster = function( pMainStackId ) {
	var that = this;
	return new Promise( function( resolve, reject ) {
		/*
		var error_handling = function( pError ) {
			winston.log('error',error);
			oPromise.reject( error );
		}
		*/
		var oGetStacks = that.get_sub_stacks( pMainStackId );
		oGetStacks.then( function( pSubStacks ) {
			if ( !pSubStacks || pSubStacks.length === 0 ) {
				pSubStacks.push( { PhysicalResourceId: pMainStackId } );
			}
			that.get_all_ec2_instance_ids_from_stacks( pSubStacks ).then( function( pData ) {
				resolve( pData );
			}, function( error ) {
				that._handle_error( error, reject );
			})
		}, function( error ) {
			that._handle_error( error, reject );
		});
	
	});
};

MyClass.prototype.get_all_ec2_instance_ids_from_stack = function( pStackName ) {
	var that = this;
	return new Promise( function( resolve, reject ) {
		var oListStachResourcesParams = {
			StackName: pStackName /* required */
			//NextToken: 'STRING_VALUE'
		};
		
		that.mClients.cf.listStackResources( oListStachResourcesParams, function( error, data ) {
			if (error) {
				that._handle_error( error, reject );
				//winston.log('error',error);
				//oPromise.reject( error );
			} else {
				var oStackResources = data.StackResourceSummaries;
				var oEc2InstanceIds = [];
				for ( var i in oStackResources ) {
					if ( oStackResources[i].ResourceType === 'AWS::EC2::Instance' )
						oEc2InstanceIds.push( oStackResources[i].PhysicalResourceId );
				}
				resolve( oEc2InstanceIds );
			}
		} );
	});
};

MyClass.prototype.get_all_ec2_instance_ids_from_stacks = function( pStacks ) {
	var that = this;
	return new Promise( function( resolve, reject ) {
		var oPromises = [];
		for ( i in pStacks ) {
			var oStack = pStacks[i];
			oPromises.push( function() { that.get_all_ec2_instance_ids_from_stack( oStack.PhysicalResourceId ) } );
		}
		
		Promises.seq( oPromises, {} ).then( function( pPromises ) {
			var oEc2InstanceIds = [];
			for ( i in pPromises ) {
				var oData = pPromises[i];
				oEc2InstanceIds = oEc2InstanceIds.concat( oData );
			}
			resolve( oEc2InstanceIds );
		}, function( error ) {
			that._handle_error( error, reject );
		});
	
	});
};

MyClass.prototype.find_PublicIp = function( pInstanceStatus ) {
	if ( ! pInstanceStatus || ! pInstanceStatus['NetworkInterfaces'] ) return null;
	var oNI = pInstanceStatus['NetworkInterfaces'];
	for ( i in oNI ) {
		var n = oNI[i];
		if ( n.Association && n.Association.PublicIp ) {
			return n.Association.PublicIp;
		}
	}
	return null;
};

MyClass.prototype.find_PrivateIpAddress = function( pInstanceStatus ) {
	if ( ! pInstanceStatus || ! pInstanceStatus['NetworkInterfaces'] ) return null;
	var oNI = pInstanceStatus['NetworkInterfaces'];
	for ( i in oNI ) {
		var n = oNI[i];
		if ( n.PrivateIpAddress ) {
			return n.PrivateIpAddress;
		}
	}
	return null;
};
	
MyClass.prototype.describe_ec2_status = function( pInstanceIds, pOutputToConsole) {
	var that = this;
	if (! that.mClients['ec2'] ) return Promise.reject('EC2 (ec2) client must be passed to constructor.');
	return new Promise( function( resolve, reject ) {
		var oOutputToConsole = pOutputToConsole !== false;
		try {
			var oEc2IdsToName = {};
			var oEc2Instances = {};
			var oEc2InstancesStatus = {};
			
			var describe_instances = function() {
				var oPromise = new Promise();
				oEc2Params = {
					InstanceIds: pInstanceIds
				};
				that.mClients.ec2.describeInstances( oEc2Params, function( error, data ) {
					if ( error ) {
						that._handle_error( error, reject );
						//winston.log('error',error );
						//console.log( error );
						//oPromise.reject( error );
					} else {
						//console.log('Describe EC2 Instances!');
						//console.log(util.inspect( data, false, null));
						for (i in data.Reservations ) {
							var r = data.Reservations[i];
							var i = r.Instances[0];
							for ( j in i.Tags ) {
								var t = i.Tags[j];
								if ( t.Key === 'Name' ) {
									oEc2IdsToName[ i.InstanceId ] = t.Value;
									oEc2Instances[ i.InstanceId ] = i;
									break;
								}
								
							}
						}
						resolve( data );
					}
				});
				return oPromise;
			};
			
			var describe_instances_status = function() {
				var oPromise = new Promise();
				oEc2Params = {
					InstanceIds: pInstanceIds
				};
				that.mClients.ec2.describeInstanceStatus( oEc2Params, function( error, data ) {
					if ( error ) {
						that._handle_error( error, reject );
						//winston.log('error',error );
						//console.log( error );
						//oPromise.reject( error );
					} else {
						//console.log('Instance Status!!!');
						//console.dir(data.InstanceStatuses);
						//winston.log('debug', data);
						
						var oStatuses = data.InstanceStatuses;
						for ( var i in oStatuses ) {
							var oStatus = oStatuses[i];
							oEc2InstancesStatus[ oStatus.InstanceId ] = oStatus;
						}
						//console.dir( oStatuses );
						
						resolve( data );
					}
				});
				
				return oPromise;
			}
			
			var display_ec2_instances_status = function() {
				return new Promise( function( resolve, reject ) {
					if (oOutputToConsole) {
						for ( i in oEc2Instances ) {
							var oEc2Instance = oEc2Instances[i];
							// augment
							oEc2Instance["Name"] = oEc2IdsToName[ oEc2Instance.InstanceId ];
							var oStatus = oEc2InstancesStatus[ oEc2Instance.InstanceId ];
							console.log('\t%s\t(%s): State=[%s], System=[%s], Instance=[%s]',
									oEc2Instance.Name, // oEc2IdsToName[ oEc2Instance.InstanceId ], 
									oEc2Instance.InstanceId, 
									oStatus ? oStatus.SystemStatus.Status : 'stopped', 
									oStatus ? oStatus.InstanceStatus.Status : 'stopped',
									oStatus ? oStatus.InstanceState.Name : 'stopped');
							//var oInstanceName = oEc2IdsToName[ oEc2Instance.InstanceId ].toUpperCase();
							//if ( oInstanceName.startsWith('MASTER') || oInstanceName.endsWith('MASTER-NODE') ) {
							if ( oStatus ) {
								console.log('\t\tPublic IP=%s', that.find_PublicIp( oEc2Instance ) );
								console.log('\t\tPrivate IP=%s', that.find_PrivateIpAddress( oEc2Instance ) );
							}
							//}
						}
					}
					resolve( oEc2Instances );
				//oPromise.resolve( "Hello world!" );
				//return oPromise;
				});
			}
			
			var oDescribeEC2Instances = describe_instances();
			var oDescribeEC2InstancesStatus = oDescribeEC2Instances.then( describe_instances_status );
			var oDisplayEC2InstancesStatus = oDescribeEC2InstancesStatus.then( display_ec2_instances_status );
			
			return oDisplayEC2InstancesStatus;
			
		} catch ( e ) {
			that._handle_error( e, reject );
			//console.log( e );
			//oPromise.reject( e );
		}
	});
};

exports = module.exports = MyClass;