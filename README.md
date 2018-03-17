# Aparcalia 2
A maps HTML5 static application to remember where did you park your vehicle.

## Description

This is a static HTML5 web app which uses the geolocation API of the browser to store the location of your vehicle. You can see your position, the vehicle position, and optionally the route of your position.

This is a static app which means that no communication is done with the server other than loading the HTML and .js files of the app itself and the loading of the map tiles (if configured). Your position, vehicle position and route are only known by your device and are not shared. Your vehicle position is stored locally in your device while you are not running Aparcalia 2. The current position and route are not stored when you exit the app.

## How to use

You can use Aparcalia2 (without maps) here: https://yomboprime.github.com/Aparcalia2

Common panning and zoom is supported in any browser. You can go fullscreen with the button at the top right corner.

You have the Menu button at the top left corner, which shows option like setting the vehicle position to the current position, center map on the current, car or both positions, and to show or not the current position past route.

To use Aparcalia 2 with maps you will have to install it in a server and place the tiles as described in the following section.


## How to install

You need to serve the Aparcalia 2 main directory in a web server through https.

To use maps you have to put the usual maps tiles directory and file structure with the form `tiles/z/x/y.png` under the `mapdata` directory. A tile full path could be for example `Aparcalia2/mapdata/tiles/0/0/0.png`

You will also have to uncomment a line in the `main.js` file, in the config definition (there is a comment there explaining that)

## License

MIT licensed.
