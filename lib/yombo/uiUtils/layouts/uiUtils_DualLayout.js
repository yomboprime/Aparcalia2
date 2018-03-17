
// For browser only

// ***** uiUtils_DualLayout class *****

function uiUtils_DualLayout() {

    this.isDualLayoutObject = true;

    // True if the layout is vertical, i.e., it divides the parent element
    // with an horizontal line. Else it is horizontal and divides with a
    // vertical line.
    this.vertical = false;

    // True if layout is based on this.position. Else based on child position
    this.flagManualPosition = true;

    // If this.flagManualPosition is false, this field is used to tell if layout
    // division is based on this.child1 size (true) or on this.child2 size (false)
    this.flagSizeChild1 = true;

    // Position of the division in pixels, if this.flagManualPosition = true
    // If this.flagSizeChild1 is true, the position is measured from the left
    // in a horizontal layout, or from top in a vertical layout.
    // Else right, bottom respectively.
    this.position = 0;

    // This gives an offset to the position. It is added to it.
    this.offset = 0;

    // Internal flag to set only once the layout from the child size
    this.flagSizeChildSet = 1;

    // Border width of each child in pixels
    this.borderWidth1 = 0;
    this.borderWidth2 = 0;

    // If true, the layout width is obtained from the childs sizes
    this.fixedWidth = false;

    // If true, the layout height is obtained from the childs sizes
    this.fixedHeight = false;

    // If true, position child1 floating
    this.floating = false;

    // Only valid if floating, tells if dialog is centered on its parent
    this.centered = true;

    // Only valid if floating, makes the dialog centered on its parent only once
    this.centerOnlyOnce = false;

    // Only valid if !floating, makes the respective childs aligned in the axis orthogonal w.r. to the layout axis.
    this.align1 = false;
    this.align2 = false;

    this.parent = null;
    this.child1 = null;
    this.child2 = null;

    this.rootContainer = null;
    this.rootLayout = null;

    this.zIndex = 0;

    // Set this sub layouts to calculate child size based on them instead on child1 and child2.
    // Useful for example when wrapping a (sub)DualLayout inside a div with scroll bars, and
    // the div inside another main DualLayout.
    this.child1SubLayout = null;
    this.child2SubLayout = null;

    // Indicates that this layout is inside a div which is inside this.superlayout
    this.superLayout = null;

    // Callbacks
    this.onPositionChanged = null;
    this.onAfterLayout1 = null;
    this.onAfterLayout2 = null;

    // Last layout values
    this.left = 0;
    this.top = 0;
    this.width = 0;
    this.height = 0;
    this.top1 = 0;
    this.top2 = 0;
    this.left1 = 0;
    this.left2 = 0;
    this.width1 = 0;
    this.width2 = 0;
    this.height1 = 0;
    this.height2 = 0;

    // Resizer
    this.resizerDiv = null;
    this.resizerThickness = 6;

};

// Constants

uiUtils_DualLayout.zIndexElements = "0";
uiUtils_DualLayout.zIndexResizers = "1";
uiUtils_DualLayout.zIndexDialogBar = "2";
uiUtils_DualLayout.zIndexDialog = "1000";

// Singleton
uiUtils_DualLayout.theSingleton = {
    currentResizerLayout: null,
    currentDraggableDialog: null,
    bodyLayouts: []
};

// Non instance functions

uiUtils_DualLayout.onResizeWindow = function() {

    // TODO if available, use first layout.rootLayout's left, top, width and height
    var width = window.innerWidth;
    var height = window.innerHeight;

    var bodyLayouts = uiUtils_DualLayout.theSingleton.bodyLayouts;
    for ( var i = 0; i < bodyLayouts.length; i++ ) {
        bodyLayouts[ i ].resetLayout();
        bodyLayouts[ i ].doLayout( 0,  0, width, height );
    }

};

uiUtils_DualLayout.getElementMaxDimension = function( vertical, el ) {

    // Returns the size of element el in one dimension. Can be a DualLayout or HTML element.
    // vertical = true for vertical dimension, false for horizontal.

    if ( ! el ) {
        return 0;
    }

    if ( el.isDualLayoutObject ) {

        var s1 = 0;
        var s2 = 0;

        if ( el.child1 ) {
            s1 = uiUtils_DualLayout.getElementMaxDimension( vertical, el.child1SubLayout ? el.child1SubLayout : el.child1 );
        }

        if ( el.child2 ) {
            s2 = uiUtils_DualLayout.getElementMaxDimension( vertical, el.child2SubLayout ? el.child2SubLayout : el.child2 );
        }

        if ( vertical === el.vertical ) {

            if ( el.flagManualPosition ) {
                if ( el.flagSizeChild1 ) {
                    return /*2 * el.borderWidth1 + */ el.position + s2 + 2 * el.borderWidth2 + el.offset;
                }
                else {
                    return 2 * el.borderWidth1 + s1 + el.position + /*2 * el.borderWidth1 + */ el.offset;
                }
            }
            else {
                return 2 * el.borderWidth1 + s1 + s2 + 2 * el.borderWidth2 + el.offset;
            }

        }
        else {

            return Math.max( s1 + 2 * el.borderWidth1, s2 + 2 * el.borderWidth2 );

        }

    }
    else {

        return getHTMLElementMaxDimension( vertical, el );

    }

};

uiUtils_DualLayout.updateParentsRecursive = function( child, parent, rootLayout, rootContainer, zIndex ) {

    if ( ! child ) {
        return;
    }

    if ( child.isDualLayoutObject ) {
        child.parent = parent;
        child.rootContainer = rootContainer;
        child.rootLayout = rootLayout;
        child.zIndex = zIndex;

        if ( child.child1 ) {
            uiUtils_DualLayout.updateParentsRecursive( child.child1, child, rootLayout, rootContainer, zIndex );
        }
        if ( child.child2 ) {
            uiUtils_DualLayout.updateParentsRecursive( child.child1, child, rootLayout, rootContainer, zIndex );
        }
    }
    else {
        child.style.zIndex = zIndex;

        if ( rootContainer && isFunction( rootContainer.contains ) && ! rootContainer.contains( child ) ) {
            rootContainer.appendChild( child );
        }
    }

};


uiUtils_DualLayout.prototype = {

    constructor: uiUtils_DualLayout

};

uiUtils_DualLayout.prototype.initialize = function( vertical, child1, child2, parent ) {

    // vertical: Set to true for vertical, false for horizontal layout.
    // child1 and child2 can be either a HTML element or a DualLayout object.
    // parent parameter is only needed when subdividing a top level layout
    // (parent is its top level container, can be document.body or a div)

    if ( this.child1 || this.child2 ) {
        throw new Error( "uiUtils_DualLayout.initialize: " + "Layout already has content." );
    }

    this.vertical = vertical;

    if ( parent ) {
        this.parent = parent;
        if ( parent.isDualLayoutObject ) {
            this.rootContainer = parent.rootContainer;
            this.rootLayout = parent;
        }
        else {
            this.rootContainer = parent;
            this.rootLayout = this;
        }
    }
    else {
        if ( this.parent ) {
            if ( this.parent.isDualLayoutObject ) {
                this.rootContainer = this.parent.rootContainer;
                this.rootLayout = this.parent.rootLayout;
            }
            else {
                throw new Error( "uiUtils_DualLayout.initialize: " + "Inconsistent layout initialization." );
            }
        }
    }

    this.child1 = child1;
    this.child2 = child2;

    uiUtils_DualLayout.updateParentsRecursive( child1, this, this.rootLayout, this.rootContainer, this.zIndex );
    uiUtils_DualLayout.updateParentsRecursive( child2, this, this.rootLayout, this.rootContainer, this.zIndex );

    // TODO detect if top level layout (parent of parent HTML div is document.body) and && it to the condition. Anyway dialogs on child divs are not working.
    if ( this.floating ) {
        uiUtils_DualLayout.theSingleton.bodyLayouts.push( this );
    }
    
};

uiUtils_DualLayout.prototype.doLayout = function( left, top, width, height ) {

    if ( ! this.floating && ! this.flagManualPosition && this.flagSizeChildSet > 0 ) {

        var resizerChild = this.child2;
        if ( this.flagSizeChild1 ) {
            resizerChild = this.child1;
        }

        // Set layout position based on largest child element recursively.
        // this.offset is added.
        var size = uiUtils_DualLayout.getElementMaxDimension( this.vertical, resizerChild );

        this.position = size + this.offset;

        this.flagSizeChildSet--;

    }

    var elWidth = 0;
    var elHeight = 0;
    if ( this.fixedWidth ) {
        elWidth = uiUtils_DualLayout.getElementMaxDimension( false, this );
    }
    else if ( this.floating ) {
        elWidth = this.width;
    }

    if ( this.fixedHeight ) {
        elHeight = uiUtils_DualLayout.getElementMaxDimension( true, this );
    }
    else if ( this.floating ) {
        elHeight = this.height;
    }

    if ( this.floating ) {

        if ( this.centered || this.centerOnlyOnce ) {
            this.left = ( Math.max( 0, width - elWidth ) * 0.5 );
            this.top = ( Math.max( 0, height - elHeight ) * 0.5 );
            this.centerOnlyOnce = false;
        }

        top = this.top;
        left = this.left;

    }

    if ( this.fixedWidth || this.floating ) {
        width = elWidth;
    }

    if ( this.fixedHeight || this.floating ) {
        height = elHeight;
    }

    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.top1 = top + ( this.floating ? 0 : this.borderWidth1 );
    this.top2 = top;
    this.left1 = left + ( this.floating ? 0 : this.borderWidth1 );
    this.left2 = left;
    this.width1 = Math.max( 0, width - 2 * this.borderWidth1 );
    this.width2 = Math.max( 0, width - 2 * this.borderWidth2 );
    this.height1 = Math.max( 0, height - 2 * this.borderWidth1 );
    this.height2 = Math.max( 0, height - 2 * this.borderWidth2 );

    if ( this.vertical ) {

        var divisionHeight = this.position;

        if ( ! this.flagSizeChild1 ) {
            divisionHeight = height - divisionHeight;
        }

        divisionHeight = Math.max( 0, Math.min( divisionHeight, height ) );

        this.height1 = Math.max( 0, divisionHeight - 2 * this.borderWidth1 );

        this.top2 = top + divisionHeight + this.borderWidth2;
        this.height2 = Math.max( 0, height - divisionHeight - 2 * this.borderWidth2 );

        if ( this.align1 && this.child1 ) {
            this.width1 = uiUtils_DualLayout.getElementMaxDimension( false, this.child1 );
            this.left1 += ( ( 0, this.width - this.width1 ) * 0.5 );
        }
        if ( this.align2 && this.child2 ) {
            this.width2 = uiUtils_DualLayout.getElementMaxDimension( false, this.child2 );
            this.left2 += ( ( 0, this.width - this.width2 ) * 0.5 );
        }

    }
    else {

        var divisionWidth = this.position;

        if ( ! this.flagSizeChild1 ) {
            divisionWidth = width - divisionWidth;
        }

        divisionWidth = Math.max( 0, Math.min( divisionWidth, width ) );

        this.width1 = Math.max( 0, divisionWidth - 2 * this.borderWidth1 );

        this.left2 = left + divisionWidth + this.borderWidth2;
        this.width2 = Math.max( 0, width - divisionWidth - 2 * this.borderWidth2 );

        if ( this.align1 && this.child1 ) {
            this.height1 = uiUtils_DualLayout.getElementMaxDimension( true, this.child1 );
            this.top1 += ( ( 0, this.height - this.height1 ) * 0.5 );
        }
        if ( this.align2 && this.child2 ) {
            this.height2 = uiUtils_DualLayout.getElementMaxDimension( true, this.child2 );
            this.top2 += ( ( this.height - this.height2 ) * 0.5 );
        }

    }

    if ( this.child1 ) {

        if ( this.child1.isDualLayoutObject ) {

            this.child1.doLayout( this.left1, this.top1, this.width1, this.height1 );

        }
        else {

            positionAndResizeHTMLElementAbsolute( this.child1, this.left1, this.top1, this.width1, this.height1 );

        }

        if ( this.onAfterLayout1 ) {
            this.onAfterLayout1( this.left1, this.top1, this.width1, this.height1 );
        }

    }

    if ( this.child2 ) {

        if ( this.child2.isDualLayoutObject ) {

            this.child2.doLayout( this.left2, this.top2, this.width2, this.height2 );

        }
        else {

            positionAndResizeHTMLElementAbsolute( this.child2, this.left2, this.top2, this.width2, this.height2 );

        }

        if ( this.onAfterLayout2 ) {
            this.onAfterLayout2( this.left2, this.top2, this.width2, this.height2 );
        }

    }

    // Layout the resizer

    if ( this.resizerDiv ) {

        var resizerOffset = Math.floor( this.resizerThickness * 0.5 );

        if ( this.vertical ) {

            positionAndResizeHTMLElementAbsolute( this.resizerDiv,
                left,
                this.top2 - resizerOffset,
                width,
                this.resizerThickness );

        }
        else {

            positionAndResizeHTMLElementAbsolute( this.resizerDiv,
                this.left2 - resizerOffset,
                top,
                this.resizerThickness,
                height );

        }

    }

};

uiUtils_DualLayout.prototype.reLayout = function() {

    this.doLayout( this.left, this.top, this.width, this.height );

};

uiUtils_DualLayout.prototype.createResizer = function() {

    if ( this.resizerDiv ) {
        throw new Error( "uiUtils_DualLayout.createResizer: " + "Layout already has a resizer." );
    }

    var backgroundColorStyle = "gray";
    var noBackgroundColorStyle = "transparent";

    var div = createHTMLDiv();
    this.resizerDiv = div;

    div.style.zIndex = uiUtils_DualLayout.zIndexResizers;
    div.style.backgroundColor = noBackgroundColorStyle;

    var scope = this;

    div.addEventListener( "mousedown", function( event ) {

        if ( event.button === 0 ) {

            uiUtils_DualLayout.theSingleton.currentResizerLayout = scope;

        }

    }, false );

    div.addEventListener( "mouseup", function( event ) {

        uiUtils_DualLayout.theSingleton.currentResizerLayout = null;

    }, false );

    div.addEventListener( "mouseenter", function( event ) {

        div.style.backgroundColor = backgroundColorStyle;

        scope.rootContainer.style.cursor = scope.vertical ? "ns-resize" : "ew-resize";

    }, false );

    div.addEventListener( "mouseleave", function( event ) {

        div.style.backgroundColor = noBackgroundColorStyle;

        scope.rootContainer.style.cursor = "default";

    }, false );

    this.rootContainer.appendChild( div );

};

uiUtils_DualLayout.prototype.destroyResizer = function() {

    if ( ! this.rootContainer ) {
        throw new Error( "uiUtils_DualLayout.destroyResizer: " + "Layout is not initilized." );
    }

    if ( ! this.resizerDiv ) {
        throw new Error( "uiUtils_DualLayout.destroyResizer: " + "Layout doesn't have a resizer." );
    }

    this.rootContainer.removeChild( this.resizerDiv );

    this.resizerDiv = null;

};

uiUtils_DualLayout.prototype.replaceChild = function( newChild, replaceChild1, destroyOldChild ) {

    var oldChild = replaceChild1 ? this.child1 : this.child2;

    if ( replaceChild1 ) {
        this.child1 = newChild;
        this.child1SubLayout = null;
    }
    else {
        this.child2 = newChild;
        this.child2SubLayout = null;
    }

    if ( newChild.isDualLayoutObject ) {

        newChild.parent = oldChild.parent;
        newChild.rootContainer = oldChild.rootContainer;
        newChild.rootLayout = oldChild.rootLayout;
        newChild.superLayout = oldChild.superLayout;

        uiUtils_DualLayout.updateParentsRecursive( newChild, this, this.rootLayout, this.rootContainer, this.zIndex );

        var left = oldChild.left;
        var top = oldChild.top;
        var width = oldChild.width;
        var height = oldChild.height;

    }
    else {

        uiUtils_DualLayout.updateParentsRecursive( newChild, this, this.rootLayout, this.rootContainer, this.zIndex );
        
    }

    if ( destroyOldChild ) {
        
        this.destroyElement( oldChild );
        
    }

    this.resetLayout();
    
    this.reLayout();

};

uiUtils_DualLayout.prototype.resetLayout = function() {

    this.position = 0;
    this.flagSizeChildSet = 1;

    if ( this.child1 && this.child1.isDualLayoutObject ) {
        this.child1.resetLayout();
    }
    
    if ( this.child2 && this.child2.isDualLayoutObject ) {
        this.child2.resetLayout();
    }

};

uiUtils_DualLayout.prototype.destroy = function() {

    if ( ! this.rootContainer ) {
        // Nothing to do
        return;
    }

    var scope = this;
    
    function destroy( child ) {

        if ( ! child ) {
            return;
        }

        if ( child.isDualLayoutObject ) {
            destroy( child.child1 );
            destroy( child.child2 );
        }
        else {
            /*
            if ( scope.rootContainer.contains( child ) ) {
                scope.rootContainer.removeChild( child );
            }
            */
            if ( child.parentNode ) {
                child.parentNode.removeChild( child );
            }
        }

    }

    destroy( this );
    
    if ( this.floating ) {
        
        var index = uiUtils_DualLayout.theSingleton.bodyLayouts.indexOf( this );
        
        if ( index >= 0 ) {
        
            uiUtils_DualLayout.theSingleton.bodyLayouts.splice( index, 1 );
            
        }
        
    }

};

uiUtils_DualLayout.prototype.destroyElement = function( el ) {

    if ( ! el ) {
        return;
    }

    if ( el.isDualLayoutObject ) {
        el.destroy();
    }
    else {
        if ( el.parentNode ) {
            el.parentNode.removeChild( el );
        }
    }

}
    
/*
 * ***** Internal functions. They should not be used outside of this file.
*/

uiUtils_DualLayout.onMouseMoveDocument = function( event ) {

    var resizerLayout = uiUtils_DualLayout.theSingleton.currentResizerLayout;

    if ( resizerLayout ) {

        var rootLayout = resizerLayout.rootLayout;

        var rect = rootLayout.rootContainer.getBoundingClientRect();

        var x = event.clientX - rect.left - resizerLayout.left;
        var y = event.clientY - rect.top - resizerLayout.top;

        // Compute new dragged position

        var pos = x;
        var length = resizerLayout.width;

        if ( resizerLayout.vertical ) {

            pos = y;
            length = resizerLayout.height;

        }

        pos = Math.max( 0, Math.min( length, pos ) );

        if ( ! resizerLayout.flagSizeChild1 ) {
            pos = length - pos;
        }

        resizerLayout.position = pos;

        // Re-layout

        rootLayout.doLayout( rootLayout.left, rootLayout.top, rootLayout.width, rootLayout.height );

        // Call callback

        if ( resizerLayout.onPositionChanged ) {
            resizerLayout.onPositionChanged( resizerLayout.position );
        }

    }
    else {

        var draggableDialog = uiUtils_DualLayout.theSingleton.currentDraggableDialog;

        if ( draggableDialog ) {

            var mainLayout = draggableDialog.mainLayout;
            var rootLayout = mainLayout.rootLayout;

            var x = event.clientX;
            var y = event.clientY;

            var xDespl = x - draggableDialog.x0;
            var yDespl = y - draggableDialog.y0;

            if ( xDespl === 0 && yDespl === 0 ) {
                return;
            }

            var xAbs = mainLayout.left + xDespl;
            var yAbs = mainLayout.top + yDespl;

            var xDest = xAbs;
            var yDest = yAbs;

            
            draggableDialog.setPosition( xDest, yDest );
            
            if ( xAbs === mainLayout.left ) {
                draggableDialog.x0 = x;
            }
            if ( yAbs === mainLayout.top ) {
                draggableDialog.y0 = y;
            }

            draggableDialog.relayoutDialog();

        }
    }
};

uiUtils_DualLayout.onMouseUpDocument = function( event ) {

    uiUtils_DualLayout.theSingleton.currentResizerLayout = null;
    uiUtils_DualLayout.theSingleton.currentDraggableDialog = null;

};

// Mouse event listeners

document.addEventListener( "mousemove", uiUtils_DualLayout.onMouseMoveDocument );
document.addEventListener( "mouseup", uiUtils_DualLayout.onMouseUpDocument );
