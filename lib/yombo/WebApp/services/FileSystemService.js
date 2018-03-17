
// For Node only

// ***** Exports *****

if ( typeof module !== 'undefined' ) {

    module.exports = FileSystemService;

}

// ***** Libraries *****
var fs = require( 'fs' );
var pathJoin = require( 'path' ).join;

// ***** FileSystemService class *****

function FileSystemService( log ) {

    this.log = log;

}

FileSystemService.prototype = {

    constructor: FileSystemService

};

FileSystemService.prototype.init = function( messageHub ) {

    var scope = this;

    messageHub.setListener( "FileSystem_readDir", function( socket, data ) {

        var path = data.path;

        if ( data.extraPath ) {
            path = pathJoin( path, data.extraPath );
        }

        if ( ! path.endsWith( "/" ) ) {
            path += "/";
        }

        var files = fs.readdirSync( path );

        var result = {
            path: path,
            fileEntries: []
        };

        var extension = data.extension;
        for ( var fi = 0, fn = files.length; fi < fn; fi++ ) {

            var fileName = files[ fi ];
            var stats = fs.statSync( pathJoin( path, fileName ) );

            // Filter files based on accepted extensions
            if ( ( ! stats.isDirectory() ) && extension ) {
                var found = false;
                var extensionCases = extension.extensions;
                var numExtensionCases = extensionCases.length;
                for ( var j = 0; j < numExtensionCases; j++ ) {
                    if ( extensionCases[ j ] === "*" || fileName.endsWith( extensionCases[ j ] ) ) {
                        found = true;
                        break;
                    }
                }
                if ( ! found ) {
                    // File is discarded due to filter
                    continue;
                }
            }

            result.fileEntries.push( {
                fileType: stats.isFile() ? 'file' : ( stats.isDirectory() ? 'dir' : 'unknown' ),
                fileName: files[ fi ],
                fileSize: stats.isFile() ? stats.size : -1
            } );
        }

        messageHub.send( socket, "FileSystem_readDir_result" + data.source, {
            error: null,
            result: result
        } );

    } );

    messageHub.setListener( "FileSystem_readFile", function( socket, data ) {
        scope.log( "readFile: " + data.path + ", "+ data.fileName );
    } );

};
