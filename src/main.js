
// Global variables

var config = {
    locate: true,
    //slocate: false,
    map: {
        minLon: 2.2796592,
        maxLon: 3.506008,
        minLat: 39.2536645,
        maxLat: 39.9793632,
        tileSize: 256,
        // Uncomment this line and comment the other to have map tiles
        // (you have to place the file structure under tiles/ and serve app with https)
        //mapTilesURL: "mapdata/tiles/{z}/{x}/{y}.png"
        mapTilesURL: "mapdata/gridTiles/grid.png"
    }
};

var theDiv;
var map;
var currentPath;
var userMarker;
var carMarker;

var isStoringTrack = false;
var isCenteringOnUser = true;

// Main code

main();

// Functions

function main() {

    changeFavicon( "favicon.png" );

    theDiv = createHTMLDiv( "mapCanvas" );
    theDiv.style.left = "0px"
    theDiv.style.top = "0px"
    theDiv.style.width = "100%";
    theDiv.style.height = "100%";
    theDiv.style.padding = "0px";
    theDiv.style.margin = "0px";
    theDiv.style.backgroundColor = "black";

    document.body.appendChild( theDiv );

    map = createMap( theDiv, config.map.minLat, config.map.maxLat, config.map.minLon, config.map.maxLon, 17 );

    initUI();
    
    recallCarPosition();

}

function createMap( htmlElement, minLat, maxLat, minLon, maxLon, initialZoom ) {

    // Create the map

    var initialLat = ( minLat + maxLat ) * 0.5;
    var initialLon = ( minLon + maxLon ) * 0.5;

    map = L.map( htmlElement, {

        //maxBounds: [ L.latLng( minLat, minLon ), L.latLng( maxLat, maxLon ) ],

        fullscreenControl: true,
        fullscreenControlOptions: {
            position: 'topright'
        }

    } ).setView( [ initialLat, initialLon ], initialZoom );

    // Tiles

    L.tileLayer( config.map.mapTilesURL, {
        
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        
        maxZoom: 17
        
    } ).addTo( map );


    // Interaction

    /*
    map.on( 'click', function( event ) {

        var latLon = event.latlng;

        console.log( "LAT, LON = " + latLon.lat + ", " + latLon.lng );

    } );
    */

    currentPath = L.polyline( [], {
        //color: 'yellow'
        color: "#FA641F"
    } ).addTo( map );
    
    map.on( 'locationfound', function( event ) {

        var latLng = event.latlng;
        
        setUserPos( latLng );
        
        if ( isStoringTrack ) {
            currentPath.addLatLng( latLng );
        }
        
        if ( isCenteringOnUser ) {
            centerUser();
        }
        
    } );

    map.on( 'locationerror', function( event ) {

        if ( ! userMarker ) {

            alert( 'Error al obtener posición: ' + event.message );

        }

    } );

    if ( config.locate ) {

        map.locate( {
            watch: true,
            timeout: 45000,
            enableHighAccuracy: true
        } );
        
    }

    return map;
}


function centerMarker( marker ) {

    if ( marker ) {
        map.fitBounds( L.latLngBounds( [ marker.getLatLng() ] ) );
    }

}

function setUserPos( latLng ) {

    if ( ! userMarker ) {
        userMarker = L.marker( latLng );
        userMarker.addTo( map );
    }
    else {
        userMarker.setLatLng( latLng );
    }

}

function setCarPos( latLng ) {

    if ( ! carMarker ) {

        var carIcon = L.icon( {
            iconUrl: "assets/icons/other/application/car/car.svg",
            iconSize: [ 32, 32 ],
            iconAnchor: [ 16, 16 ],
            popupAnchor: [ 0, -16 ]
        } );
        
        carMarker = L.marker( latLng, {
            icon: carIcon
        } );

        carMarker.addTo( map );

    }
    else {
        carMarker.setLatLng( latLng );
    }
    
}

function placeCarHere() {
    
    if ( ! userMarker ) {
        alert( "Aún no está la posición disponible." );
        return;
    }
    
    var latLng = userMarker.getLatLng();

    setCarPos( latLng );
    
    storeCarPosition( carMarker.getLatLng() );

}

function storeCarPosition( latLng ) {
    
    window.localStorage.setItem( 'car', ! latLng ? "" : JSON.stringify( {
        lat: latLng.lat,
        lng: latLng.lng
    } ) );
    
}

function recallCarPosition() {

    
    var str = window.localStorage.getItem( 'car' );
    
    if ( ! str ) {
        return;
    }
    
    var car = JSON.parse( str );

    if ( ! car || car.lat === undefined || car.lng === undefined ) {
        return;
    }

    setCarPos( L.latLng( car.lat, car.lng ) );

}

function centerUser() {

    centerMarker( userMarker );

}

function centerCar() {

    centerMarker( carMarker );

    isCenteringOnUser = false;

}

function centerBoth() {

    if ( userMarker && carMarker ) {
        map.fitBounds( L.latLngBounds( [ userMarker.getLatLng(), carMarker.getLatLng() ] ) );

        isCenteringOnUser = false;

    }

}

function toggleCenterUser() {

    if ( isCenteringOnUser ) {
        isCenteringOnUser = false;
    }
    else {
        centerUser();
        isCenteringOnUser = true;
    }
}

function toggleViewRoute() {
    
    if ( isStoringTrack ) {
        currentPath.setLatLngs( [] );
        isStoringTrack = false;
    }
    else {
        isStoringTrack = true;
    }
}

function animate() {

    requestAnimationFrame( animate );

    // .tick()

    render();

}

function render() {

    //renderer.render( scene, camera );

}
