
// Global variables

var renderer;

// Functions

function initGraphics() {

    renderer = new THREE.WebGLRenderer();
    //renderer.setClearColor( 0xbfd1e5 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

}
