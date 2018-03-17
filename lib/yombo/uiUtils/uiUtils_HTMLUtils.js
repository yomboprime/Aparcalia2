
// Functions for pure HTML elements manipulation

// For browser only

function setHTMLElementVisibility( el, visible ) {

    if ( visible ) {
        el.style.display = "block";
    }
    else {
        el.style.display = "none";
    }

}

function positionHTMLElementAbsolute( el, left, top ) {

    el.style.position = "absolute";
    el.style.left = left + "px";
    el.style.top = top + "px";

}

function setWidthHTMLElementAbsolute( el, width ) {

    el.style.position = "absolute";
    el.style.width = width + "px";

}

function setHeightHTMLElementAbsolute( el, height ) {

    el.style.position = "absolute";
    el.style.height = height + "px";

}

function resizeHTMLElementAbsolute( el, width, height ) {

    el.style.position = "absolute";
    el.style.left = "0px";
    el.style.top = "0px";
    el.style.width = width + "px";
    el.style.height = height + "px";

}

function positionAndResizeHTMLElementAbsolute( el, left, top, width, height ) {

    el.style.position = "absolute";
    el.style.left = left + "px";
    el.style.top = top + "px";
    el.style.width = width + "px";
    el.style.height = height + "px";

}

// Functions to get/set info about HTML elements

function isHTMLDiv( el ) {
    return el.tagName === 'DIV';
}

function getHTMLElementMaxDimension( vertical, el ) {

    var value = 0;

    if ( el.tagName === "BODY" ) {
        if ( vertical ) {
            return window.innerHeight;
        }
        else {
            return window.innerWidth;
        }
    }

    if ( ! isHTMLDiv( el ) ) {


        var boundingRectElement = el.getBoundingClientRect();

        if ( vertical ) {
            value = boundingRectElement.height;
        }
        else {
            value = boundingRectElement.width;
        }

    }

    var children = el.children;
    var elVertical = children.length > 0 && children[ 0 ].style.display !== "inline";
    if ( elVertical === vertical ) {

        var sum = 0;
        for ( var i = 0, n = children.length; i < n; i++ ) {

            var child = children[ i ];

            sum += getHTMLElementMaxDimension( vertical, child );

        }

        value = Math.max( value, sum );

    }
    else {

        for ( var i = 0, n = children.length; i < n; i++ ) {

            var child = children[ i ];

            value = Math.max( value, getHTMLElementMaxDimension( vertical, child ) );

        }

    }

    return value;

}


function readInputValue( input ) {
    return input.type === "checkbox" ? input.checked : input.value;
}

function setInputValue( input, value ) {
    if ( input.type === "checkbox" ) {
        input.checked = value ? true : false;
    }
    else {
        input.value = value;
    }
}

function getHTMLValue( el ) {

    if ( el.tagName === "INPUT" ) {
        return readInputValue( el );
    }

    return el.innerHTML;

}

function setHTMLValue( el, value ) {

    if ( el.tagName === "INPUT" ) {
        setInputValue( el, value );
    }
    else {
        el.innerHTML = value;
    }

}
