
// Pure HTML elements creation and handling functions.

// Only for browser.

function createHTMLElement( type, id ) {

    var el = document.createElement( type );
    el.id = id;
    return el;

}

function createHTMLDiv( id ) {

    return createHTMLElement( 'div', id );

}

function wrapInHTMLDiv( el, id ) {

    var div = createHTMLDiv( id );
    div.appendChild( el );
    return div;

}

var inputTypesHTML = [ "text", "color", "checkbox", "email", "number", "password", "range", "url", "file" ];

function isValidHTMLInputType( type ) {
    return inputTypesHTML.indexOf( type ) >= 0;
}

function createHTMLInput( type, id ) {

    if ( ! isValidHTMLInputType( type ) ) {
        throw new Error( "Unsupported HTML input type: " + type );
    }

    var input = createHTMLElement( 'input', id );

    input.type = type;

    return input;

}

function createHTMLTextArea( id ) {

    return createHTMLElement( 'textarea', id );

}

function createHTMLSpan( id ) {

    return createHTMLElement( 'span', id );

}

function createHTMLTextSpan( text ) {

    var span = createHTMLSpan();
    span.innerText = text;
    span.style.fontFamily = "Arial";

    return span;

}

function removeHTMLDataList( id ) {
    var list = document.getElementById( id );
    if ( list ) {
        document.body.removeChild( list );
    }
}

function createImage( src, width, height ) {

    var image = createHTMLElement( 'img' );

    image.src = src;

    if ( width ) {
        image.width = width;
    }

    if ( height ) {
        image.height = height;
    }

    return image;

}

function createImageURLFromContent( content, type ) {
    
    return window.URL.createObjectURL( new Blob( [ content ], { type: type } ) );

}

function createSVGFromContent( content ) {
    return createImageURLFromContent( content, "image/svg+xml" );
}

function createCanvas( width, height ) {

    var canvas = createHTMLElement( 'canvas' );

    canvas.width = width;
    canvas.height = height;

    return canvas;

}

function createHTMLLinearLayoutPanel( vertical, childs, parentContainer, aligned ) {

    var childDisplay = vertical ? "block" : "inline";

    for ( var i = 0, n = childs.length; i < n; i++ )  {

        var child = childs[ i ];

        child.style.display = childDisplay;

        if ( aligned ) {

            child.style.verticalAlign = "middle";

        }

        parentContainer.appendChild( child );

    }

    parentContainer.style.overflow = "hidden";
    parentContainer.style.padding = "0px";

    return parentContainer;

}

function createHTMLIconButton( iconImageSrc, iconImageWidth, iconImageHeight ) {

    // Creates a button with icon

    var button = createHTMLElement( 'button' );
    button.style.borderWidth = "0px";
    button.style.margin = "0px";
    button.style.padding = "0px";
    button.style.backgroundColor = "transparent";

    button.appendChild( createImage( iconImageSrc, iconImageWidth, iconImageHeight ) );

    return button;
}

function createHTMLButtonWithText( text, iconImageSrc, iconImageWidth, iconImageHeight, swap ) {

    // Creates a button with icon and/or text

    swap = swap || false;

    var button = createHTMLElement( 'button' );

    var childs = [];
    var image = null;
    var span = null;

    if ( iconImageSrc ) {

        image = createImage( iconImageSrc, iconImageWidth, iconImageHeight );

        childs.push( image );

    }

    if ( text ) {

        span = createHTMLTextSpan( text );
        span.style.paddingLeft = "6px";
        span.style.paddingRight = "6px";
        if ( iconImageSrc ) {
            span.style.paddingLeft = "12px";
        }
        childs.push( span );

    }

    return {
        button: createHTMLLinearLayoutPanel( false, childs, button, !swap ),
        image: image,
        span: span
    };

}

function createHTMLButtonWithTextOptions( options ) {
    
    var button = createHTMLButtonWithText(
        options.text,
        options.iconImageSrc,
        options.iconImageWidth,
        options.iconImageHeight,
        options.swap
    );
    
    //button.button.style.paddingLeft = "10px";
    //button.button.style.paddingRight = "10px";

    if ( options.onClick ) {
        button.button.addEventListener( "click", options.onClick, false );
    }

    return button;

};

function changeHTMLButtonText( button, newText ) {
    var children = button.children;
    for ( var i = 0, n = children.length; i < n; i++ ) {
        var child = children[ i ];
        if ( child.tagName === "SPAN" ) {
            child.innerText = newText;
            return;
        }
    }
}

function changeHTMLButtonIcon( button, newIcon ) {
    var children = button.children;
    for ( var i = 0, n = children.length; i < n; i++ ) {
        var child = children[ i ];
        if ( child.tagName === "IMG" ) {
            button.insertBefore( newIcon, child );
            button.removeChild( child );
            return;
        }
    }
}

function createScrolledDiv( childDiv ) {

    // Creates a scrolled div. childDiv must be a div and will contain the scrolled content.

    var scrolledDiv = createHTMLDiv();

    scrolledDiv.style.overflowX = "hidden";
    scrolledDiv.style.overflowY = "scroll";

    scrolledDiv.appendChild( childDiv );

    return scrolledDiv;

}
