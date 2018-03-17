
// For browser only.


// ***** uiUtils_PropertiesPanel class *****

function uiUtils_PropertiesPanel() {

    this.config = null;

    this.mainLayout = new uiUtils_DualLayout();

}

uiUtils_PropertiesPanel.prototype = {

    constructor: uiUtils_PropertiesPanel

};

uiUtils_PropertiesPanel.createTitleSpan = function( text, title ) {

    var titleSpan = createHTMLTextSpan( text );
    titleSpan.style.paddingLeft = "10px";
    titleSpan.style.whiteSpace = "nowrap";
    titleSpan.style.fontWeight = "bold";
    titleSpan.style.color = "#A0A0A0";
    
    if ( title !== undefined ) {
        // '.title' means tooltip here
        titleSpan.title = title;
    }

    return titleSpan;

};

uiUtils_PropertiesPanel.createSeparatorDiv = function( title ) {

    var separator = createHTMLDiv();
    separator.style.background = "#A0A0A0";
    separator.style.borderWidth = "1px";

    if ( title !== undefined ) {
        separator.title = title;
    }

    return separator;
};

uiUtils_PropertiesPanel.createTitle = function( property ) {

    var title = uiUtils_PropertiesPanel.createTitleSpan( property.text, property.title );

    property.layout.initialize( false, title, null );
    property.layout.flagManualPosition = false;
    property.layout.flagSizeChild1 = true;

};

uiUtils_PropertiesPanel.createSeparator = function( property ) {

    var separator = uiUtils_PropertiesPanel.createSeparatorDiv( property.title );

    property.layout.initialize( false, separator, null );
    property.layout.flagManualPosition = false;
    property.layout.flagSizeChild1 = false;
    property.layout.borderWidth1 = 1;

};

uiUtils_PropertiesPanel.prototype.initialize = function( config ) {

    this.config = config;

    var properties = config.properties;
    
    var linearLayout = null;

    var parentDiv = null;

    if ( config.scrolled ) {

        linearLayout = new uiUtils_DualLayout();

        parentDiv = initializeLayoutWithScrolledSublayout( config.parent, this.mainLayout, linearLayout );

    }
    else {

        linearLayout = this.mainLayout;

        parentDiv = config.parent;

    }

    var optionsInputsLayouts = [];
    
    var n = properties.length;

    for ( var i = 0; i < n; i++ ) {
        optionsInputsLayouts.push( new uiUtils_DualLayout() );
    }

    initializeLinearLayout( linearLayout, true, optionsInputsLayouts, parentDiv, true, 5, false );
    linearLayout.fixedHeight = true;

    var scope = this;

    for ( var i = 0; i < n; i++ ) {

        var property = properties[ i ];

        property.layout = optionsInputsLayouts[ i ];

        switch( property.type ) {
            
            case "title":
                uiUtils_PropertiesPanel.createTitle( property );
                break;
                
            case "separator":
                uiUtils_PropertiesPanel.createSeparator( property );
                break;
                
            default:

                property.onInput = function( prop ) {
                    return function( event ) {
                        var input = event.target;
                        var value = readInputValue( input );
                        
                        if ( prop.checkValue ) {

                            var oldValue = prop.targetObject[ prop.targetKey ];
                            
                            if ( ! prop.checkValue( value ) ) {
                                setInputValue( prop.input, oldValue );
                                return;
                            }
                        }

                        prop.targetObject[ prop.targetKey ] = value;

                        if ( prop.onChange ) {
                            prop.onChange( value );
                        }

                        if ( scope.config.callback ) {
                            scope.config.callback();
                        }
                    };
                }( property );

                createInputBoxWithLabel( property );

                setInputValue( property.input, property.targetObject[ property.targetKey ] );

                break;
        }

    }

};
