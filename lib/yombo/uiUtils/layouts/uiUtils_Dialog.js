// 
// For browser only.


// ***** uiUtils_Dialog class *****

function uiUtils_Dialog() {
    
    this.config = null;

    this.mainLayout = new uiUtils_DualLayout();
    this.mainLayout.floating = true;
    this.mainLayout.zIndex = uiUtils_DualLayout.zIndexDialog;
    
    this.containerDiv = null;
    this.bar = null;
    this.titleSpan = null;
    
    this.x0 = 0;
    this.y0 = 0;
    
    this.isOpen = false;

};

uiUtils_Dialog.setDialogStyleToDiv = function( div ) {
    div.style.backgroundColor = "white";
    div.style.boxShadow = "0px 1px 3px rgba(0, 0, 0, 0.05) inset, 0px 0px 24px rgba(82, 168, 236, 0.9)";
    div.style.zIndex = uiUtils_DualLayout.zIndexDialog;
};

uiUtils_Dialog.prototype = {

    constructor: uiUtils_Dialog

};

uiUtils_Dialog.prototype.initialize = function( config ) {

    // Config consistency checks
    
    this.config = config;
    
    if ( config.displayBar || config.scrolled ) {
        config.makeContainerDiv = true;
    }

    if ( config.centered && config.displayBar ) {
        config.displayBar.draggable = false;
    }


    // Create dialog bar

    var dialogBar = null;
    if ( config.displayBar ) {
        dialogBar = this.createBar();
        this.bar = dialogBar;
    }
    else {
        dialogBar = null;
    }

    var scope = this;


    // Create scroll
    
    var content = config.content;
    var scrollLayout = null;
    if ( config.scrolled ) {

        var scrolledDiv = createHTMLDiv();
        var scrollContainerDiv = createScrolledDiv( scrolledDiv );
        uiUtils_Dialog.setDialogStyleToDiv( scrollContainerDiv );
        
        content = scrollContainerDiv;
        
        scrollLayout = new uiUtils_DualLayout();
    }

    if ( config.makeContainerDiv ) {
        
        var containerDiv = createHTMLDiv();
        this.containerDiv = containerDiv;
        uiUtils_Dialog.setDialogStyleToDiv( containerDiv );
        containerDiv.style.overflowX = "hidden";
        containerDiv.style.overflowY = "hidden";
        containerDiv.style.margin = "0";
        //containerDiv.style.padding = "10px";
        //containerDiv.style.paddingLeft = "10px";
        //containerDiv.style.paddingRight = "10px";
        //containerDiv.style.borderWidth = "10px";

        //  Layout for arranging the dialog bar and the dialog content
        var layout = new uiUtils_DualLayout();

        this.mainLayout.initialize( true, containerDiv, null, config.parent );
        this.mainLayout.flagSizeChild1 = false;

        this.mainLayout.onAfterLayout1 = function( top, left, width, height ) {

            layout.doLayout( 0, 0, width, height );

        };
        this.mainLayout.child1SubLayout = layout;
        layout.superLayout = this.mainLayout;
        
        layout.initialize( true, dialogBar, content, containerDiv );
        layout.flagManualPosition = false;
        layout.flagSizeChild1 = true;

        if ( scope.config.displayBar ) {
            
            layout.flagManualPosition = true;
            layout.position = config.displayBar.size;
            
            var barLayoutDone = false;
            layout.onAfterLayout1 = function( top, left, width, height ) {

                if ( ! barLayoutDone ) {

                    scope.config.barMainLayout.doLayout( 0, 0, width, height );

                    barLayoutDone = true;

                }
            };
        }
        
        if ( scrollLayout ) {   

            scrollLayout.initialize( true, config.content, null, content );
            scrollLayout.flagManualPosition = false;
            scrollLayout.flagSizeChild1 = false;
            scrollLayout.fixedHeight = true;

            var scrollLayoutDone = false;
            layout.onAfterLayout2 = function( top, left, width, height ) {

                if ( ! scrollLayoutDone ) {
                    scrollLayout.doLayout( 0, 0, width, height );
                    scrollLayoutDone = true;
                }

            };
        }

    }
    else {
        
        this.mainLayout.initialize( true, config.content, null, config.parent );

    }

    if ( config.centered !== undefined ) {
        this.mainLayout.centered = config.centered;
    }
    if ( config.centerOnlyOnce !== undefined ) {
        this.mainLayout.centerOnlyOnce = config.centerOnlyOnce;
    }
    if ( config.top !== undefined ) {
        this.mainLayout.top = config.top;
    }
    if ( config.left !== undefined ) {
        this.mainLayout.left = config.left;
    }
    if ( config.fixedWidth !== undefined ) {
        this.mainLayout.fixedWidth = config.fixedWidth;
    }
    if ( config.fixedHeight !== undefined ) {
        this.mainLayout.fixedHeight = config.fixedHeight;
    }
    if ( config.width !== undefined ) {
        this.mainLayout.width = config.width;
    }
    if ( config.height !== undefined ) {
        this.mainLayout.height = config.height;
    }

};

uiUtils_Dialog.prototype.setTitle = function( title ) {
    
    if ( this.titleSpan ) {
        
        this.titleSpan.innerHTML = title;
        
    }
    
};
    
uiUtils_Dialog.prototype.open = function( data ) {

    if ( this.isOpen ) {
        return;
    }

    if ( this.containerDiv ) {
        setHTMLElementVisibility( this.containerDiv, true );
    }
    
    this.relayoutDialog();
    
    this.setPosition( this.mainLayout.left, this.mainLayout.top );
    
    this.relayoutDialog();
    
    this.isOpen = true;
    
    if ( this.config.onOpen ) {
        this.config.onOpen( data );
    }

};

uiUtils_Dialog.prototype.close = function( data, init ) {

    if ( ! this.isOpen && ! init ) {
        return;
    }

    if ( this.containerDiv ) {
        setHTMLElementVisibility( this.containerDiv, false );
    }
    
    this.isOpen = false;

    if ( this.config.onClose && ! init ) {
        this.config.onClose( data );
    }

};

uiUtils_Dialog.prototype.destroy = function() {

    this.mainLayout.destroy();

    if ( this.config.parent.isDualLayoutObject ) {
        // Nothing to do
        return;
    }

};

uiUtils_Dialog.prototype.relayoutDialog = function() {

    // TODO use dialog.mainLayout.rootLayout left, top, width and height
    var width = window.innerWidth;
    var height = window.innerHeight;

    this.mainLayout.resetLayout();
    this.mainLayout.doLayout( 0,  0, width, height );

};

uiUtils_Dialog.prototype.setPosition = function( x, y ) {
            
    if ( this.config.displayBar && this.config.displayBar.parentConstraint ) {

        var parent = this.config.parent;
        var maxX = uiUtils_DualLayout.getElementMaxDimension( false, parent ) - this.mainLayout.width;
        var maxY = uiUtils_DualLayout.getElementMaxDimension( true, parent ) - this.mainLayout.height;

        x = Math.max( 0, Math.min( maxX, x ) );
        y = Math.max( 0, Math.min( maxY, y ) );

    }

    this.mainLayout.left = x;
    this.mainLayout.top = y;
        
};

uiUtils_Dialog.prototype.createBar = function() {

    var dialogBar = createHTMLDiv();
    uiUtils_Dialog.setDialogStyleToDiv( dialogBar );
    dialogBar.style.backgroundColor = "white";
    dialogBar.style.zIndex = uiUtils_DualLayout.zIndexDialogBar;
    
    var scope = this;
    
    var config = this.config.displayBar;

    if ( config.draggable ) {

        dialogBar.addEventListener( "mousedown", function( event ) {

            if ( event.button === 0 ) {

                scope.x0 = event.clientX;
                scope.y0 = event.clientY;
                uiUtils_DualLayout.theSingleton.currentDraggableDialog = scope;

            }

        }, false );

        dialogBar.addEventListener( "mouseenter", function( event ) {

            scope.mainLayout.rootContainer.style.cursor = "move";

        }, false );

        dialogBar.addEventListener( "mouseleave", function( event ) {

            scope.mainLayout.rootContainer.style.cursor = "default";

        }, false );

    }

    
    var layout1 = new uiUtils_DualLayout();
    layout1.zIndex = uiUtils_DualLayout.zIndexDialogBar;
    this.config.barMainLayout = layout1;

    var closeButton = null;
    if ( config.displayCloseButton ) {
        closeButton = createHTMLIconButton( config.closeButtonSrc, config.size, config.size );
        closeButton.addEventListener( "click", function() {
            scope.close();
        }, false );
    }

    var titleSpan = null;
    if ( config.title ) {
        titleSpan = createHTMLTextSpan( config.title );
        titleSpan.style.paddingLeft = "6px";
        titleSpan.style.paddingRight = "6px";
        this.titleSpan = titleSpan;
    }

    if ( config.title && config.displayCloseButton ) {

        var layout2 = new uiUtils_DualLayout();

        layout1.initialize( false, titleSpan, layout2, dialogBar );
        layout1.flagManualPosition = false;
        layout1.flagSizeChild1 = false;
        layout1.align1 = true;

        layout2.initialize( false, null, closeButton );
        layout2.flagManualPosition = false;
        layout2.flagSizeChild1 = true;

    }
    else if ( config.title ) {

        layout1.initialize( false, titleSpan, null, dialogBar );
        layout1.flagManualPosition = false;
        layout1.flagSizeChild1 = true;

    }
    else {

        layout1.initialize( false, null, closeButton, dialogBar );
        layout1.flagManualPosition = false;
        layout1.flagSizeChild1 = false;

    }

    return dialogBar;

};
