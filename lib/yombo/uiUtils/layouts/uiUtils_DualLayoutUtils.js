
// UI Elements based on the DualLayout
// Only for browser.

function createInputBox( options ) {

    // Creates a input with text caption. Options:
    // options.id Optional id
    // options.type One of inputTypesHTML array
    // options.layout Mandatory, Duallayout object
    // options.text Mandatory text explaining the input
    // options.title Optional title (tooltip)
    // options.onInput Optional input change callback
    // There are additional options based on input type

    var input = createHTMLInput( options.type, options.id );
    options.input = input;

    switch ( options.type ) {
        case "text":
            if ( options.maxLength !== undefined ) {
                input.maxlength = options.maxLength;
            }
            if ( options.size !== undefined ) {
                input.size = options.size;
            }
            break;
        case "color":
            break;
        case "checkbox":
            break;
        case "email":
            break;
        case "number":
        case "range":
            if ( options.min !== undefined ) {
                input.min = options.min;
            }
            if ( options.max !== undefined ) {
                input.max = options.max;
            }
            if ( options.step !== undefined ) {
                input.step = options.step;
            }
            break;
        case "password":
            break;
        case "url":
            break;
    }

    if ( options.onInput ) {
        input.addEventListener( "input", options.onInput, false );
    }

    if ( options.title !== undefined ) {
        input.title = options.title;
    }

    return input;

}

function createInputBoxWithLabel( options ) {

    // Creates a input with text caption.
    
    var input = createInputBox( options );

    initializeHorizontalLayoutWithLabel( options.layout, options.text, input, options.type === "checkbox", options.title );

    return input;

}

function initializeHorizontalLayoutWithLabel( layout, displayText, element, inverted, title ) {

    // Creates a input with text caption

    var span = createHTMLTextSpan( displayText );
    span.style.paddingLeft = "6px";
    span.style.paddingRight = "6px";

    if ( title !== undefined ) {
        span.title = title;
    }


    var div = createHTMLDiv();
    var childs = [ span, element ];
    if ( inverted ) {
        childs = [ element, span ];
    }

    createHTMLLinearLayoutPanel( false, childs, div, true );

    layout.initialize( false, div, null );

    layout.flagManualPosition = false;
    layout.flagSizeChild1 = false;
    //layout.offset = 5;

    // TODO if element is a DualLayout object, link the layout.onAfterLayout1 to do the layout of the element.

    return layout;

}

function initializeLinearLayout( layout, vertical, childs, parent, readOrder, offset, fixedSize ) {

    // layout parameter must be created but not initialized
    // parent is optional

    if ( childs.length === 0 ) {
        throw new Error( "uiUtils_DualLayout.initializeLinearLayout: " + "Childs array is empty." );
    }

    offset = offset || 0;

    var linearLayouts = [];
    for ( var i = 0, n = childs.length - 1; i < n; i++ )  {

        linearLayouts[ i ] = new uiUtils_DualLayout();

    }

    var linearLayout = layout;
    for ( i = 0, n = childs.length; i < n; i++ )  {

        if ( readOrder ) {
            linearLayout.initialize( vertical, childs[ i ], ( i === n - 1 ) ? null : linearLayouts[ i ], ( i === 0 ) ? parent : null );
        }
        else {
            linearLayout.initialize( vertical, ( i === n - 1 ) ? null : linearLayouts[ i ], childs[ i ], ( i === 0 ) ? parent : null );
        }

        linearLayout.flagManualPosition = fixedSize;
        linearLayout.flagSizeChild1 = readOrder;
        linearLayout.offset = offset;

        linearLayout = linearLayouts[ i ];

    }

    return linearLayouts;

}

function getLayoutFromLinearLayout( linearLayout, layoutIndex ) {

    while ( layoutIndex > 0 ) {
        
        linearLayout = linearLayout.child2;
        layoutIndex--;
        
    }
    
    return linearLayout;
    
}

function alignLinearLayout( layout, align1, align2 ) {

    while ( layout ) {

        layout.align1 = align1;
        layout.align2 = align2;

        if ( layout.child2.isDualLayoutObject ) {
            layout = layout.child2;
        }
        else {
            return;
        }
    }
}

function initializeLayoutWithScrolledSublayout( parent, mainLayout, subLayout ) {

    subLayout.fixedHeight = true;

    var scrolledDiv = createHTMLDiv();
    var scrollContainerDiv = createScrolledDiv( scrolledDiv );

    mainLayout.initialize( true, scrollContainerDiv, null, parent );
    mainLayout.onAfterLayout1 = function( top, left, width, height ) {

        positionAndResizeHTMLElementAbsolute( scrolledDiv, 0, 0, width, height );

        subLayout.doLayout( 0, 0, width, height );

    };

    mainLayout.flagManualPosition = false;
    mainLayout.flagSizeChild1 = false;
    mainLayout.child1SubLayout = subLayout;

    return scrolledDiv;

}

function getElementValue( el ) {

    if ( el.isDualLayoutObject ) {
        if ( el.child1 ) {
            return getElementValue( el.child1 );
        }
        else if ( el.child2 ) {
            return getElementValue( el.child1 );
        }
        else {
            return null;
        }
    }
    else {
        return getHTMLValue( el );
    }

}

function initializeButtonsLinearLayout( layout, options ) {

    var childs = [];

    for ( var i = 0; i < options.buttons.length; i++ ) {

        var button = createHTMLButtonWithTextOptions( options.buttons[ i ] );
        
        childs.push( button.button );
        
        if ( options.interSpace !== undefined && i < options.buttons.length - 1 ) {
            childs.push( createCanvas( options.interSpace, options.interSpace ) );
        }

    }

    initializeLinearLayout( layout, options.vertical, childs, options.parent, options.readOrder, options.offset, options.fixedSize );

}
