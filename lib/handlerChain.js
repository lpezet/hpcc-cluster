const winston = require('winston');

HandlerChain = function( pHandlers ) { 
	this.mHandlers = pHandlers ? pHandlers : [];
	this.mPos = 0;
	this.mTotalHandlers = pHandlers ? pHandlers.length : 0;
};

HandlerChain.prototype.doHandle = function( pError, pPromise ) {
	if ( this.mPos < this.mTotalHandlers ) {
		try {
			var oHandler = this.mHandlers[ this.mPos++ ];
			if ( oHandler ) oHandler.doHandle( pError, pPromise, this );
		} catch( e ) {
			console.log( e );
			winston.log('error', e);
			if ( pPromise ) pPromise.reject( e ); //TODO: e or pError???
		}
	}
}

exports = module.exports = HandlerChain;
