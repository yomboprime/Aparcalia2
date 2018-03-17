
// For browser or Node

// ***** Exports *****

if ( typeof module !== 'undefined' ) {

    module.exports = MessageHub;

}

// ***** Libraries *****

if ( typeof objectUtils === 'undefined' ) {
    objectUtils = require( "../objectUtils/objectUtils" );
}

// ***** MessageHub class *****

function MessageHub( log ) {

    this.log = log;

    this.listenersByType = {};

    this.nextBinaryMessageType = undefined;

    var scope = this;

    this.onClientConnection = function( socket ) {

        socket.onmessage = function messageHubOnMessage( e ) {

            var type;
            var data;

            if ( e.data instanceof ArrayBuffer ) {

                // Binary message

                type = scope.nextBinaryMessageType;

                if ( type === undefined ) {
                    scope.log( "Error (messageHubOnMessage) received binary message without prior identifying type message." );
                    return;
                }

                data = e.data;

                scope.nextBinaryMessageType = undefined;

            }
            else {

                // JSON message

                var jsonData = JSON.parse( e.data );
                if ( ! jsonData ) {
                    scope.log( "Error (messageHubOnMessage) parsing JSON WebSockets message." );
                    return;
                }

                type = jsonData.type;

                if ( ! type ) {
                    scope.log( "Error (messageHubOnMessage): Websocket JSON message without type received." );
                    return;
                }

                if ( jsonData.nextBinaryMessage ) {
                    // scope JSON message is a prelude to a binary message
                    scope.nextBinaryMessageType = type;
                    return;
                }

                data = jsonData.data;
                if ( ! data ) {
                    scope.log( "Error (messageHubOnMessage) JSON message without 'data' field." );
                    return;
                }

            }

            // Send data to listener

            var listener = scope.listenersByType[ type ];
            if ( ! listener ) {
                scope.log( "Error (messageHubOnMessage): Websocket JSON message of unknown type received: " + type );
                return;
            }

            listener.callback( socket, data );

        };

    };

}

MessageHub.prototype = {

    constructor: MessageHub

};

MessageHub.prototype.setListener = function( type, callback ) {

    var listener = {
        type: type,
        callback: callback
    };

    this.listenersByType[ type ] = listener;

};

MessageHub.prototype.getOnClientConnection = function() {

    return this.onClientConnection;

};

MessageHub.prototype.send = function( socket, type, data ) {

    if ( data instanceof ArrayBuffer ) {

        // Send first a JSON message telling the type of following binary message
        socket.send( JSON.stringify( {
            nextBinaryMessage: true,
            type: type
        } ) );

        // Send the actual binary message
        socket.send( data );

    }
    else {
        // Send JSON message
        socket.send( JSON.stringify( {
            type: type,
            data: data
        } ) );
    }

};
