
// For browser only.


// ***** uiUtils_GridLayout class *****

function uiUtils_GridLayout() {

    this.config = null;

    this.mainLayout = new uiUtils_DualLayout();

};

uiUtils_GridLayout.prototype = {

    constructor: uiUtils_GridLayout

};

uiUtils_GridLayout.prototype.initialize = function( config ) {

    this.config = config;

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

    var columns = config.columns;
    var rows = config.rows;
    var nColumns = columns.length;

    // Create the columns
    var columnLayouts = [];
    for ( var i = 0; i < nColumns; i++ ){
        columnLayouts[ i ] = new uiUtils_DualLayout();
    }
    var linearLayouts = initializeLinearLayout( linearLayout, false, columnLayouts, parentDiv, true, 0, true );

    var layout = linearLayout;
    var i = 0;
    var n = linearLayouts.length + 1;
    while ( i < n ) {
        if ( columns[ i ].size ) {

            // Set column fixed height
            layout.offset = columns[ i ].size;

            // Create column resizer
            if ( config.columnsAreResizable ) {
                layout.createResizer();
            }

        }
        else {
            layout.flagManualPosition = false;
        }
        if ( i < n - 1 ) {
            layout = linearLayouts[ i ];
        }
        i++;
    }

    // Create the rows
    var nRows = rows.length;
    for ( var i = 0; i < nColumns; i++ ) {

        var columnElements = [];
        if ( config.header ) {
            var span = createHTMLTextSpan( columns[ i ].title );
            span.style.fontWeight="bold";
            var header = wrapInHTMLDiv( span );
            columnElements.push( header );
        }

        for ( var j = 0; j < nRows; j++ ) {
            columnElements.push( rows[ j ][ i ] );
        }

        initializeLinearLayout( columnLayouts[ i ], true, columnElements, null, true, config.rowHeight || 0, config.rowHeight !== undefined && config.rowHeight > 0 );

    }

};

