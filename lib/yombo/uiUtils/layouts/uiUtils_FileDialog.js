
// For browser only

// ***** uiUtils_FileDialog class *****

function uiUtils_FileDialog( config ) {

    this.config = null;
    this.log = null;
    this.dialog = null;

    this.favouritesListLayout = null;
    this.fileGrid = null;
    // This is the parent layout of the file grid, necessary to update it.
    this.rightPanelLayout2 = null;

    this.currentDirectoryFileEntries = [];
    this.currentExtensionIndex = 0;
    this.fileNameInput = null;
    this.filePathInput = null;
    this.currentSelectedFileEntryIndex = -1;

    this.deselectCurrentFileEntry = null;
    this.enableActionButton = null;

    this.source = "FileDialog_" + uiUtils_FileDialog.dialogId++;

    this.init( config );

}

uiUtils_FileDialog.dialogId = 0;

uiUtils_FileDialog.prototype = {

    constructor: uiUtils_FileDialog

};

uiUtils_FileDialog.prototype.init = function( config ) {

    this.log = config.log || console.log;

    this.config = config;

    config.acceptedExtensions = config.acceptedExtensions || [];
    //config.acceptedExtensions.push( { extensionName: this.config.translation[ "any file" ], extensions: [ "*" ] } );

    this.createUI();

    var scope = this;
    config.messageHub.setListener( "FileSystem_readDir_result" + this.source, function( socket, data ) {

        var entries = null;

        if ( data.error ) {
            // TODO
            scope.log( "Error in readdir" );

            entries = [];
        }
        else {
            entries = data.result.fileEntries;
        }

        scope.currentDirectoryFileEntries = entries;

        scope.sortFileEntries();

        scope.regenerateFileGrid();

        setInputValue( scope.filePathInput, data.result.path );
        scope.config.currentDirectory = data.result.path;

        scope.currentSelectedFileEntryIndex = -1;

    } );

};

uiUtils_FileDialog.prototype.open = function( ) {

    this.dialog.open();

    this.obtainCurrentDirectory();

};

uiUtils_FileDialog.prototype.removeUI = function( ) {

    this.dialog.destroy();

};

uiUtils_FileDialog.prototype.createUI = function() {

    this.dialog = new uiUtils_Dialog();

    var mainLayout = new uiUtils_DualLayout();

    var scope = this;

    this.dialog.initialize( {

        parent: document.body,
        content: mainLayout,

        scrolled: false,
        makeContainerDiv: true,
        centered: false,
        centerOnlyOnce: true,
        fixedWidth: false,
        fixedHeight: false,
        width: 800,
        height: 500,

        displayBar: {
            size: 32,
            title: this.config.actionText,
            draggable: true,
            parentConstraint: true,
            displayCloseButton: true,
            closeButtonSrc: this.config.closeButtonSrc
        },

        onClose: function() {
            log( "Test dialog closed." );
        }

    } );

    // Layouts creation

    var favouritesMainLayout = new uiUtils_DualLayout();
    var favouritesBarLayout = new uiUtils_DualLayout();
    var favouritesBarLayout2 = new uiUtils_DualLayout();
    this.favouritesListLayout = new uiUtils_DualLayout();

    var rightPanelLayout = new uiUtils_DualLayout();
    this.rightPanelLayout2 = new uiUtils_DualLayout();
    var rightPanelLayout3 = new uiUtils_DualLayout();
    var pathBarLayout = new uiUtils_DualLayout();
    var currentPathBar = new uiUtils_DualLayout();
    this.fileGrid = new uiUtils_GridLayout();
    var currentFileLayout = new uiUtils_DualLayout();
    var buttonsLayout = new uiUtils_DualLayout();

    // Main layout
    mainLayout.initialize( false, favouritesMainLayout, rightPanelLayout, null );
    mainLayout.createResizer();
    mainLayout.position = 200;
    mainLayout.flagManualPosition = true;
    mainLayout.flagSizeChild1 = true;

    // Favourites panel
    favouritesMainLayout.initialize( true, favouritesBarLayout, this.favouritesListLayout, null );
    favouritesMainLayout.flagManualPosition = false;
    favouritesMainLayout.flagSizeChild1 = true;

    var favouritesText = createHTMLTextSpan( this.config.translation.favourites );
    var buttonAddFavourite = createHTMLIconButton( this.config.addFavouriteButtonSrc, 32, 32 );
    var buttonRemoveFavourite = createHTMLIconButton( this.config.removeFavouriteButtonSrc, 32, 32 );

    favouritesBarLayout.initialize( false, favouritesText, favouritesBarLayout2 );
    favouritesBarLayout.flagManualPosition = false;
    favouritesBarLayout.flagSizeChild1 = false;
    favouritesBarLayout.align1 = true;

    favouritesBarLayout2.initialize( false, buttonAddFavourite, buttonRemoveFavourite );
    favouritesBarLayout2.flagManualPosition = false;
    favouritesBarLayout2.flagSizeChild1 = true;

    // Right panel
    rightPanelLayout.initialize( true, pathBarLayout, this.rightPanelLayout2 );
    rightPanelLayout.flagManualPosition = false;
    rightPanelLayout.flagSizeChild1 = true;

    this.rightPanelLayout2.initialize( true, this.fileGrid.mainLayout, rightPanelLayout3 );
    this.rightPanelLayout2.flagManualPosition = false;
    this.rightPanelLayout2.flagSizeChild1 = false;

    rightPanelLayout3.initialize( true, currentFileLayout, buttonsLayout );
    rightPanelLayout3.flagManualPosition = false;
    rightPanelLayout3.flagSizeChild1 = true;
    //this.rightPanelLayout2.borderWidth1 = 1;

    var buttonGoUp = createHTMLIconButton( this.config.goUpButtonSrc, 16, 16 );
    buttonGoUp.addEventListener( "click", function() {
        scope.obtainCurrentDirectory( "../" );
    }, false );
    var pathBarLayout2 = new uiUtils_DualLayout();
    pathBarLayout.initialize( false, pathBarLayout2, null, null );
    pathBarLayout.flagManualPosition = false;
    pathBarLayout.flagSizeChild1 = true;
    pathBarLayout2.initialize( false, currentPathBar, buttonGoUp, null );
    pathBarLayout2.flagManualPosition = false;
    pathBarLayout2.flagSizeChild1 = true;

    // Path input box
    this.filePathInput = createInputBox( {
        type: "text",
        layout: currentPathBar,
        text: this.config.translation.path + ":",
        size: 45,
        title: this.config.translation[ "path explanation" ]
    } );

    this.filePathInput.addEventListener( "keypress", function( event ) {
        if ( event.keyCode === 13 ) {
            scope.obtainDirectory( readInputValue( scope.filePathInput ) );
        }
    }, false );

    // Extension drop-down list
    function getExtensionButtonText( extension ) {
        return scope.config.translation.extension + ": " + extension;
    }

    var extensions = scope.config.acceptedExtensions;
    var buttonFileExtension = createHTMLButtonWithText( getExtensionButtonText( extensions[ this.currentExtensionIndex ].extensions[ 0 ] ), null, 0, 0, false );
    buttonFileExtension.addEventListener( "click", function() {
        var menuConfig = {
            onOptionClicked: function( option ) {
                for ( var i = 0, n = extensions.length; i < n; i++ ) {
                    var extension = extensions[ i ];
                    if ( extension.extensions[ 0 ] === option.value ) {
                        scope.currentExtensionIndex = i;
                        scope.deselectCurrentFileEntry();
                        setInputValue( scope.fileNameInput, "" );
                        scope.enableActionButton();
                        changeHTMLButtonText( buttonFileExtension, getExtensionButtonText( extensions[ scope.currentExtensionIndex ].extensions[ 0 ] ) );
                        currentFileLayout.reLayout();
                        scope.obtainCurrentDirectory();
                        break;
                    }
                }
            },
            options: [],
            scrolled: false,
            locationComponent: buttonFileExtension
        };
        extensions.forEach( function( extension ) {
            var text = extension.extensionName + " (";
            for ( var i = 0, n = extension.extensions.length; i < n; i++ ) {
                text += "*." + extension.extensions[ i ] + ( i === n - 1 ? ")" : ", " );
            }
            var extensionOption = {
                text: text,
                value: extension.extensions[ 0 ]
            };
            menuConfig.options.push( extensionOption );
        } );

        new uiUtils_Menu( menuConfig );

    }, false );

    var fileNameLayout = new uiUtils_DualLayout();

    currentFileLayout.initialize( false, fileNameLayout, buttonFileExtension, null );
    currentFileLayout.flagManualPosition = false;
    currentFileLayout.flagSizeChild1 = true;

    // File name input box
    this.fileNameInput = createInputBox( {
        type: "text",
        layout: fileNameLayout,
        text: this.config.translation.name + ":",
        size: 35,
        title: this.config.translation[ "file name" ],
        onInput: function() {
            scope.log( "File name changed: " + readInputValue( scope.fileNameInput ) );
            scope.enableActionButton();
        }
    } );

    this.fileNameInput.addEventListener( "keypress", function( event ) {
        if ( event.keyCode === 13 && readInputValue( scope.fileNameInput ) !== "" ) {
            scope.acceptAction();
        }
    }, false );

    // Buttons in the dialog bottom part

    var actionButton = null;
    var buttonCancel = createHTMLButtonWithText( this.config.translation.cancel, this.config.closeButtonSrc, 32, 32, false );
    buttonCancel.addEventListener( "click", function() {
        scope.dialog.close();
    }, false );

    var childButtons = [ buttonCancel ];
    var buttonsConfig = this.config.buttons;
    for ( var i = 0; i < buttonsConfig.length; i++ ) {
        var buttonConfig = buttonsConfig[ i ];
        var button = createHTMLButtonWithText( buttonConfig.text, buttonConfig.iconSrc, 32, 32, false );
        button.title = buttonConfig.title;
        button.addEventListener( "click", function( btnConfig, scope  ) {
            return function() {
                btnConfig.callback( scope.currentDirectory, scope.currentFileName, scope.config.acceptedExtensions[ scope.currentExtensionIndex ].extensions[ 0 ] );
            };
        }( buttonConfig, scope ), false );
        childButtons.push( button );
        if ( i == 0 ) {
            actionButton = button;
        }
    }

    initializeLinearLayout( buttonsLayout, false, childButtons, null, false, 0, false );

    this.enableActionButton = function() {
        if ( ! actionButton ) {
            return;
        }
        var fileName = readInputValue( scope.fileNameInput );
        actionButton.disabled = fileName === "";
    };
    this.enableActionButton();

    // Populate the file grid
    this.createFileGrid();

};

uiUtils_FileDialog.prototype.createFileGrid = function() {

    var fileGridConfig = {

        header: true,
        scrolled: true,
        columnsAreResizable: true,
        rowHeight: 22,

        columns: [
            {
                title: this.config.translation[ "directory abbreviated" ],
                size: 40
            },
            {
                title: this.config.translation[ "file name" ],
                size: 380
            },
            {
                title: this.config.translation[ "extension abbreviated" ],
                size: 50
            },
            {
                title: this.config.translation[ "file size" ],
                size: 130
            }
        ],
        rows: [
        ]
    };

    function getFilenameExtension( path ) {

        pathLastIndexOfDot = path.lastIndexOf( "." );

        if ( pathLastIndexOfDot > 0 && path.length > pathLastIndexOfDot + 1) {
            return path.substring( pathLastIndexOfDot + 1 );
        }
        else {
            return "";
        }

    }

    var scope = this;

    function setRowListeners( rowIndex ) {
        var row = fileGridConfig.rows[ rowIndex ];
        row.forEach( function( el ) {

            el.addEventListener( "click", function() {

                // Highlighting
                if ( scope.currentSelectedFileEntryIndex >= 0 ) {
                    setRowBackground( scope.currentSelectedFileEntryIndex, false );
                }
                scope.currentSelectedFileEntryIndex = rowIndex;
                setRowBackground( rowIndex, true );

                // File selection
                var fileEntry = scope.currentDirectoryFileEntries[ scope.currentSelectedFileEntryIndex ];
                if ( fileEntry ) {
                    if ( fileEntry.fileType === "file" ) {
                        setInputValue( scope.fileNameInput, fileEntry.fileName );
                        scope.enableActionButton();
                    }
                }

            }, false );

            el.addEventListener( "dblclick", function() {

                // Handle "open directory" case
                if ( scope.currentSelectedFileEntryIndex >= 0 ) {
                    var gridFileEntry = scope.currentDirectoryFileEntries[ scope.currentSelectedFileEntryIndex ];
                    if ( gridFileEntry.fileType === "dir" ) {
                        scope.obtainCurrentDirectory( gridFileEntry.fileName + "/" );
                        return;
                    }
                }

                scope.acceptAction();

            }, false );

        } );
    }

    function setRowBackground( rowIndex, highlighted ) {
        var row = fileGridConfig.rows[ rowIndex ];
        if ( row ) {
            var color = null;
            if ( highlighted ) {
                color = "rgb( 20, 160, 210 )";
            }
            else {
                if ( ( rowIndex & 1 ) === 1 ) {
                    color = "rgb( 234, 250, 255 )";
                }
                else {
                    color = "rgb( 255, 255, 255 )";
                }
            }
            row.forEach( function( el ) {
                el.style.backgroundColor = color;
            } );
        }
    }

    function deselectCurrentFileEntry() {
        if ( scope.currentSelectedFileEntryIndex >= 0 ) {
            setRowBackground( scope.currentSelectedFileEntryIndex, false );
            scope.currentSelectedFileEntryIndex = -1;
        }
    }

    this.deselectCurrentFileEntry = deselectCurrentFileEntry;

    var entries = this.currentDirectoryFileEntries;
    for ( var i = 0, n = entries.length; i < n; i++ ) {

        var entry = entries[ i ];

        var row = [];

        // File type icon
        var fileTypeIcon = null;
        switch ( entry.fileType ) {
            case 'file':
                fileTypeIcon = createHTMLIconButton( this.config.fileIconSrc, 16, 16 );
                break;
            case 'dir':
                fileTypeIcon = createHTMLIconButton( this.config.directoryIconSrc, 16, 16 );
                break;
            default:
                fileTypeIcon = createHTMLIconButton( this.config.unknownIconSrc, 16, 16 );
                break;
        }
        row.push( fileTypeIcon );

        // File name
        var divFileName = wrapInHTMLDiv( createHTMLTextSpan( entry.fileName ) );
        //var divFileName = createHTMLDiv();
        //divFileName.innerHTML = entry.fileName;
        divFileName.style.overflow = "hidden";
        divFileName.style.overflowY = "hidden";
        divFileName.style.textOverflow = "ellipsis";
        divFileName.style.whiteSpace = "nowrap";
        row.push( divFileName );

        // File extension
        var divFileExtension = wrapInHTMLDiv( createHTMLTextSpan( getFilenameExtension( entry.fileName ) ) );
        divFileExtension.style.overflowX = "hidden";
        divFileExtension.style.overflowY = "hidden";
        row.push( divFileExtension );

        // File size
        var divFileSize = wrapInHTMLDiv( createHTMLTextSpan( entry.fileSize >= 0 ? "" + entry.fileSize : "" ) );
        divFileSize.style.overflowX = "hidden";
        divFileSize.style.overflowY = "hidden";
        row.push( divFileSize );

        fileGridConfig.rows.push( row );

        setRowListeners( i );
        setRowBackground( i, false );

    }

    this.fileGrid.initialize( fileGridConfig );

};

uiUtils_FileDialog.prototype.regenerateFileGrid = function() {

    this.fileGrid.mainLayout.destroy();

    this.fileGrid = new uiUtils_GridLayout();

    this.createFileGrid();

    this.rightPanelLayout2.replaceChild( this.fileGrid.mainLayout, true );

};

uiUtils_FileDialog.prototype.sortFileEntries = function() {

    this.currentDirectoryFileEntries.sort( function( a, b ) {
        if ( a.fileType < b.fileType ) {
            return -1;
        }
        else if ( a.fileType > b.fileType ) {
            return 1;
        }
        else {
            if ( a.fileName < b.fileName ) {
                return -1;
            }
            else if ( a.fileName > b.fileName ) {
                return 1;
            }
            else {
                return 0;
            }
        }
    } );

};

uiUtils_FileDialog.prototype.obtainCurrentDirectory = function( extraPath ) {

    this.obtainDirectory( this.config.currentDirectory, extraPath );

};

uiUtils_FileDialog.prototype.obtainDirectory = function( path, extraPath ) {

    this.config.messageHub.send( this.config.socket, "FileSystem_readDir", {
        source: this.source,
        path: path,
        extraPath: extraPath,
        extension: this.config.acceptedExtensions[ this.currentExtensionIndex ]
    } );

};

uiUtils_FileDialog.prototype.acceptAction = function() {

    this.log( "Accept action: " + readInputValue( this.fileNameInput ) );

    var fileName = readInputValue( this.fileNameInput );

    this.config.currentFileName = fileName;

/*
        this.config.messageHub.send( this.config.socket, "FileSystem_readFile", {
            source: this.source,
            path: this.config.currentDirectory,
            fileName: this.config.currentFileName
        } );

        this.dialog.close();
*/

};
