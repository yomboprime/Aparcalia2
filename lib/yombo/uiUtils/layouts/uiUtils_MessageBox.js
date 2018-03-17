

function uiUtils_showMessageBox( options ) {

    var contentAndButtonsLayout = new uiUtils_DualLayout();
    
    var contentLayout = contentAndButtonsLayout;
    
    var marginLayout;
    if ( options.margin !== undefined ) {
        marginLayout = new uiUtils_DualLayout();
        contentLayout = marginLayout;
    }

    var dialogButtonsLayout = new uiUtils_DualLayout();

    var dialog = new uiUtils_Dialog();

    dialog.initialize( {
        parent: document.body,
        scrolled: options.scrolled !== undefined ? options.scrolled : false,
        centered: options.centered !== undefined ? options.centered : false,
        centerOnlyOnce: options.centerOnlyOnce,
        left: options.left,
        top: options.top,
        fixedWidth: options.fixedWidth,
        fixedHeight: options.fixedHeight,
        displayBar: {
            title: options.title,
            draggable: options.draggable,
            parentConstraint: options.parentConstraint !== undefined ? options.parentConstraint : true,
            size: options.barSize,
            displayCloseButton: options.displayCloseButton,
            closeButtonSrc: options.closeButtonSrc
        },
        content: contentLayout,
        onOpen: options.onOpen,
        onClose: function( data ) {
            dialog.destroy();
            if ( options.onClose ) {
                options.onClose( data );
            }
        }
    } );
    
    if ( options.margin !== undefined ) {
        marginLayout.initialize( true, contentAndButtonsLayout, null );
        marginLayout.flagManualPosition = false;
        marginLayout.flagSizeChild1 = false;
        marginLayout.borderWidth1 = options.margin;
    }
    
    contentAndButtonsLayout.initialize( true, options.content, dialogButtonsLayout );
    contentAndButtonsLayout.flagManualPosition = false;
    contentAndButtonsLayout.flagSizeChild1 = false;
    
    initializeButtonsLinearLayout( dialogButtonsLayout, {
        vertical: false,
        readOrder: false,
        interSpace: 5,
        buttons: options.buttons
    } );

    if ( options.initContentCallback ) {
        options.initContentCallback();
    }

    dialog.open();

    return dialog;

}
