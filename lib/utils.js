const getIP = require('external-ip')();
//const util = require('util');
const net = require('net');

Utils = function() {
};

Utils.prototype.resolve_target = function( pState, pTarget ) {
	var oTarget = pTarget || '@master';
	if ( oTarget.startsWith( '@' ) ) {
		oTarget = this.state_get_node_public_ip( pState, oTarget.substring( 1 ) );
	}
	return oTarget;
};

Utils.prototype.state_get_node_public_ip = function( pClusterState, pNodeName ) {
	if ( net.isIP( pNodeName ) ) return pNodeName;
	if ( ! pClusterState || ! pClusterState[ 'Topology' ] ) return null;
	var oNodeName = pNodeName || 'master';
	var oNodeStatus = pClusterState[ 'Topology' ][ oNodeName.toLowerCase() ];
	//console.dir( oNodeStatus );
	return this.find_PublicIp( oNodeStatus );
};

Utils.prototype.find_PublicIp = function( pInstanceStatus ) {
	if ( ! pInstanceStatus || ! pInstanceStatus['NetworkInterfaces'] ) return null;
	var oNI = pInstanceStatus['NetworkInterfaces'];
	for (var i in oNI ) {
		var n = oNI[i];
		if ( n.Association && n.Association.PublicIp ) {
			return n.Association.PublicIp;
		}
	}
	return null;
};
/*
Utils.prototype._shuffle = function ( pString ) {
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

Utils.prototype._random_string = function( pLength, pCodec ) {
	var oCodec = pCodec || "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz~!@#$%^&*()_+`-={}|[]<>?,./";
	var oSCodec = this._shuffle( oCodec );
    var randomstring = '';
    for (var i=0; i< pLength; i++) {
        var rnum = Math.floor(Math.random() * oCodec.length);
        randomstring += oSCodec.substring(rnum,rnum+1);
    }
    return randomstring;
};
*/
Utils.prototype.merge_devices = function( pSource, pTarget ) {
	var sourceDevices={};
	var targetDevices={};
	var sourceDevice, targetDevice;
	for (var i in pSource) {
		sourceDevice=pSource[i];
		sourceDevices[sourceDevice['DeviceName']] = sourceDevice;
	}
	for (var i in pTarget) {
		targetDevice=pTarget[i];
		targetDevices[targetDevice['DeviceName']] = targetDevice;
	}
	for (var dev in sourceDevices) {
		if ( ! targetDevices[dev] ) pTarget.push( sourceDevices[dev] );
	}
}

Utils.prototype.merge_new_only = function( pSource, pTarget ) {
	if ( pSource == null ) return pTarget;
	for (var key in pSource) {
		if ( Array.isArray( pSource[key] ) ) {
			if ( pTarget[key] == null ) pTarget[key] = [];
			if ( key === 'Volumes' ) {
				// special case for Volumes: unique DeviceNames!
				this.merge_devices( pSource[key], pTarget[key]);
			} else {
				pTarget[key] = pTarget[key].concat( pSource[key] );
			}
		} else {
			if ( pTarget[key] == null ) {
				pTarget[key] = pSource[key];
			}
		}
	}
	return pTarget;
};

Utils.prototype.get_external_ip = function() {
	return new Promise( function( resolve, reject ) {
		getIP(function (err, ip) {
			if (err) {
				//winston.log('error',error);
				reject( err );
			} else {
				resolve( ip );
			}
		});
	});
};

Utils.prototype.pad = function(num, size) {
	var sNum = "" + num;
	if ( size < sNum.length ) return sNum;
	var s = "0000000000000000000000000000000000" + sNum;
	return s.substr(s.length-size);
};

Utils.prototype.nodeId = function(num) {
	return "node" + this.pad(num, 5);
};

Utils.prototype.getAddrIP = function( pCIDR ) {
	return pCIDR.toString().split("/")[0];
};

exports = module.exports = Utils;
