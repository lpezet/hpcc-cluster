var path    = require('path');
const Client = require('ssh2').Client;

SSHClient = function() {
}

var ssh2_scpFile = function( pClientOpts, pRemoteFile, pLocalFile, pCallback) {
	pRemoteFile = pRemoteFile.replace(/[\\]/g,'/'); // windows needs this
	var remotePath = path.dirname(pRemoteFile);
	ssh2_exec( pClientOpts, 'mkdir -p ' + remotePath, function( err, stdout, stderr, server, conn ) {
		if (err) {
			pCallback( err, stdout, stderr, server, conn );
			return;
		}
		
		conn.sftp(function sftpOpen(err, sftp){
			if (err) {
				pCallback( err, "", "", server, conn );
				return;
			}
			
			try{
		        //debug('stream start');
				var rStream = Fs.createReadStream( pLocalFile );
		        var wStream = sftp.createWriteStream(pRemoteFile, {flags: 'w+', encoding: null, autoClose: true});
		        wStream.on('error', function (err) {
		          //debug('stream error %j', err);
		          wStream.removeAllListeners('finish');
		          pCallback( err, "", "", server, conn);
		        });
		        /*
		        wStream.on('finish', function () {
		        	wStream.close();
		        	pCallback( null, "", "", server, conn);
		        });
		        */
		        writeStream.on('close', function () {
                        console.log( "- file transferred" );
                        sftp.end();
                        //process.exit( 0 );
                        pCallback( null, "", "", server, conn);
                    }
                );
		        
		        rStream.pipe( wStream );
		      } catch(ex) {
		    	  pCallback( ex, "", "", server, conn);
		      }
		});
	});
}

var ssh2_writeToFile = function( pClientOpts, pRemoteFile, pContent, pCallback) {
	pRemoteFile = pRemoteFile.replace(/[\\]/g,'/'); // windows needs this
	var remotePath = path.dirname(pRemoteFile);
	ssh2_exec( pClientOpts, 'mkdir -p ' + remotePath, function( err, stdout, stderr, server, conn ) {
		if (err) {
			pCallback( err, stdout, stderr, server, conn );
			return;
		}
		
		conn.sftp(function sftpOpen(err, sftp){
			if (err) {
				pCallback( err, "", "", server, conn );
				return;
			}
			
			try{
		        //debug('stream start');
		        var wStream = sftp.createWriteStream(pRemoteFile, {flags: 'w+', encoding: null, autoClose: true});
		        wStream.on('error', function (err) {
		          //debug('stream error %j', err);
		          wStream.removeAllListeners('finish');
		          pCallback( err, "", "", server, conn);
		        });
		        wStream.on('finish', function () {
		        	wStream.close();
		        	pCallback( null, "", "", server, conn);
		        });
		        wStream.end(''+pContent);
		      } catch(ex) {
		    	  pCallback( ex, "", "", server, conn);
		      }
		});
	});
}

var ssh2_exec = function( pClientOpts, pCmd, pCallback ) {
	var conn = new Client();
	conn.on('ready', function() {
	  conn.exec( pCmd, function(err, stream) {
	    if (err) {
	    	pCallback( err, "", "", null, conn );
	    	return;
	    }
	    var stdout = '';
	    var stderr = '';
	    
	    
	    stream.on('close', function(code, signal) {
	      //console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
	      var err = null;
	      if ( stderr || code ) {
	    	  err = new Error( stderr || code );
	      }
	      pCallback( err, stdout, stderr, null, conn );
	    }).on('data', function(data) {
	    	stdout = data;
	    }).stderr.on('data', function(data) {
	      	stderr = data;
	    });
	  });
	}).on('error', function(err) {
		pCallback(err, "", "", null, conn);
	}).connect( pClientOpts );

}

SSHClient.prototype.exec = function( pClientOpts, pCmd, pCallback ) {
	//SSH2Utils.exec( pClientOpts, pCmd, pCallback); //function(err, stdout, stderr, server, conn){
	ssh2_exec( pClientOpts, pCmd, pCallback);
};

SSHClient.prototype.writeFile = function( pClientOpts, pFilename, pContent, pCallback ) {
	//SSH2Utils.writeFile( pClientOpts, pFilename, pContent, pCallback );
	ssh2_writeToFile( pClientOpts, pFilename, pContent, pCallback ) ;
};

SSHClient.prototype.scpFile = function( pClientOpts, pRemoteFilename, pLocalFilename, pCallback ) {
	//SSH2Utils.writeFile( pClientOpts, pFilename, pContent, pCallback );
	ssh2_scpFile( pClientOpts, pRemoteFilename, pLocalFilename, pCallback ) ;
};

exports = module.exports = SSHClient;
