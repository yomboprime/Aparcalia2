
// For browser only

// ***** uiUtils_Menu class *****

function uiUtils_Menu( config ) {

    this.config = null;
    this.dialog = null;

    this.init( config );

};

uiUtils_Menu.prototype = {

    constructor: uiUtils_Menu

};

uiUtils_Menu.prototype.init = function( config ) {

    this.config = config;
    
    var scope = this;

    if ( config.parent === undefined ) {
        config.parent = document.body;
    }

    this.dialog = new uiUtils_Dialog();

    var mainLayout = new uiUtils_DualLayout();

    this.dialog.initialize( {

        parent: config.parent,
        content: mainLayout,

        scrolled: config.scrolled,
        makeContainerDiv: true,
        centered: false,
        centerOnlyOnce: false,
        fixedWidth: false,
        fixedHeight: false,

        onClose: function() {
            // Nothing to do
        }

    } );

    function createButtonListener( button, option ) {

        button.addEventListener( "click", function() {

            if ( option.options ) {
                // Create submenu
                option.parent = config.parent;
                option.onOptionClicked = config.onOptionClicked;
                option.locationComponent = config.locationComponent;
                option.left = config.left;
                option.top = config.top;
                option.scrolled = config.scrolled;
                new uiUtils_Menu( option );
            }
            else {
                config.onOptionClicked( option );
                scope.dialog.destroy();
            }

        }, false );

    }

    var childs = [];

    if ( config.scrolled ) {

        config.options.forEach( function( option ) {

            var child = new uiUtils_DualLayout();

            childs.push( child );

        } );

        initializeLinearLayout( mainLayout, true, childs, null, true, 0, false );

        var i = 0;
        config.options.forEach( function( option ) {

            var button = createHTMLButtonWithText( option.text, option.iconImageSrc, option.iconImageWidth, option.iconImageHeight, option.swap ? true: false ).button;

            createButtonListener( button, option );

            var child = childs[ i++ ];
            child.initialize( false, button, null, null );
            child.flagManualPosition = true;
            child.flagSizeChild1 = false;
            child.position = 20;

        } );

    }
    else {
        config.options.forEach( function( option ) {

            var child = createHTMLButtonWithText( option.text, option.iconImageSrc, option.iconImageWidth, option.iconImageHeight, option.swap ? true: false ).button;

            createButtonListener( child, option );

            childs.push( child );

        } );

        initializeLinearLayout( mainLayout, true, childs, null, true, 0, false );

    }

    var menuLeft = config.left;
    var menuTop = config.top;
    var menuWidth = uiUtils_DualLayout.getElementMaxDimension( false, mainLayout ) + ( config.scrolled ? 20 : 0 );
    var menuHeight = uiUtils_DualLayout.getElementMaxDimension( true, mainLayout );
    var parentWidth = uiUtils_DualLayout.getElementMaxDimension( false, config.parent );
    var parentHeight = uiUtils_DualLayout.getElementMaxDimension( true, config.parent );

    var incremWidth = 0;
    var incremHeight = 0;

    if ( config.locationComponent ) {

        var rect = config.locationComponent.getBoundingClientRect();

        menuLeft = rect.left;
        menuTop = rect.top + rect.height;

        incremWidth = rect.width;
        incremHeight = rect.height;

    }

    if ( menuTop + menuHeight > parentHeight ) {
        menuTop -= menuHeight + incremHeight;
    }

    if ( menuLeft + menuWidth > parentWidth ) {
        menuLeft -= menuWidth;
    }

    this.dialog.mainLayout.left = menuLeft;
    this.dialog.mainLayout.top = menuTop;
    this.dialog.mainLayout.width = menuWidth;
    this.dialog.mainLayout.height = menuHeight;

    var mainDiv = this.dialog.mainLayout.child1;

    mainDiv.addEventListener( "mouseleave", function() {
        scope.dialog.destroy();
    }, false );

    var firstClick = true;
    var clickListener = function( event ) {

        if ( firstClick ) {
            firstClick = false;
            return;
        }

        var rect = scope.dialog.mainLayout.rootLayout.rootContainer.getBoundingClientRect();

        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        if ( x < menuLeft || x > menuLeft + menuWidth ||
             y < menuTop || y > menuTop + menuHeight ) {
            document.body.removeEventListener( "click", clickListener, false );
            scope.dialog.destroy();
        }
    };

    document.body.addEventListener( "click", clickListener, false );

    this.dialog.mainLayout.doLayout( 0, 0, parentWidth, parentHeight );

};

uiUtils_Menu.prototype.doDestroy = function( ) {

    this.dialog.destroy;

    //this.config.parent.removeChild( this.dialog );

};
