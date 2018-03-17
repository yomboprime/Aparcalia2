
// Global variables

var ui = {
    openMenuButton: null,
    distanceLabel: null,
    menuOptions: null,
    menu: null
};

// Functions

function initUI() {

    var ICON_SIZE = 64;
    
    ui.distanceLabel = createHTMLDiv();
    ui.distanceLabel.style.zIndex = 1000;
    ui.distanceLabel.innerHTML = "Distancia: 34.0 m";
    ui.distanceLabel.style.color = "black";
    ui.distanceLabel.style.position = "absolute";
    ui.distanceLabel.style.bottom = "50px";
    ui.distanceLabel.style.left = "50px";
    theDiv.appendChild( ui.distanceLabel );
    
    ui.setDistanceLabel = function( str ) {
        ui.distanceLabel.innerHTML = str;
    };
    
    ui.openMenuButton = createHTMLButtonWithText( "Menú", "assets/icons/tango/icons/Antialias_Icon.svg", ICON_SIZE, ICON_SIZE );
    ui.openMenuButton.button.style.zIndex = 1000;
    ui.openMenuButton.button.style.position = "absolute";
    ui.openMenuButton.button.style.top = "20px";
    ui.openMenuButton.button.style.left = "20px";
    theDiv.appendChild( ui.openMenuButton.button );

    var OPTION_PLACE_CAR = 0;
    var OPTION_CENTER_USER = 1;
    var OPTION_CENTER_CAR = 2;
    var OPTION_CENTER_BOTH = 3;
    var OPTION_VIEW_ROUTE = 4;
    
    ui.menuOptions = {
        scrolled: false,
        top: 0,
        left: 0,
        parent: theDiv,
        locationComponent: ui.openMenuButton.button,
        options: [
            {
                text: "Situar coche aquí",
                iconImageSrc: "assets/icons/other/application/car/car.svg",
                iconImageWidth: ICON_SIZE,
                iconImageHeight: ICON_SIZE,
                value: OPTION_PLACE_CAR
            },
            {
                text: "No centrar mapa en mi posición",
                iconImageSrc: "assets/icons/tango/icons/View-zoom-target.svg",
                iconImageWidth: ICON_SIZE,
                iconImageHeight: ICON_SIZE,
                value: OPTION_CENTER_USER
            },
            {
                text: "Centrar mapa en el coche",
                iconImageSrc: "assets/icons/tango/icons/View-zoom-target.svg",
                iconImageWidth: ICON_SIZE,
                iconImageHeight: ICON_SIZE,
                value: OPTION_CENTER_CAR
            },
            {
                text: "Centrar mapa en ambos",
                iconImageSrc: "assets/icons/tango/icons/View-zoom-target.svg",
                iconImageWidth: ICON_SIZE,
                iconImageHeight: ICON_SIZE,
                value: OPTION_CENTER_BOTH
            },
            {
                text: "Visualizar ruta",
                iconImageSrc: "assets/icons/tango/icons/Utilities-system-monitor.svg",
                iconImageWidth: ICON_SIZE,
                iconImageHeight: ICON_SIZE,
                value: OPTION_VIEW_ROUTE
            },
        ],
        onOptionClicked: function( option ) {
            switch ( option.value ) {

                case OPTION_PLACE_CAR:
                    placeCarHere();
                    break;

                case OPTION_CENTER_USER:
                    toggleCenterUser();
                    break;

                case OPTION_CENTER_CAR:
                    centerCar();
                    break;

                case OPTION_CENTER_BOTH:
                    centerBoth();
                    break;

                case OPTION_VIEW_ROUTE:
                    toggleViewRoute();
                    break;

            }
            
            ui.menuOptions.options[ OPTION_CENTER_USER ].text = isCenteringOnUser ? "No centrar mapa en mi posición" : "Centrar mapa en mi posición";
            ui.menuOptions.options[ OPTION_VIEW_ROUTE ].text = isStoringTrack ? "No visualizar ruta" : "Visualizar ruta";
        }
    };

    ui.openMenuButton.button.addEventListener( "click", function() {

        console.log( "Amem..." );
        
        ui.menu = new uiUtils_Menu( ui.menuOptions );
        
        ui.menu.dialog.open();

    }, false );

}
