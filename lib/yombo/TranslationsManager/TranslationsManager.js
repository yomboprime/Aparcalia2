
// For browser or Node


// ***** Exports *****
if ( typeof module !== 'undefined' ) {

    module.exports = TranslationsManager;

}

// ***** Libraries *****

if ( typeof objectUtils === 'undefined' ) {
    objectUtils = require( "../objectUtils/objectUtils" );
}

// ***** TranslationsManager class (browser / Node) *****

function TranslationsManager( log ) {

    this.log = log;

    // Available translations language abbreviations
    this.languages = [ "en" ];

    // The translations
    this.translations = [];

    this.currentTranslation = null;

    this.pathJoin = null;
    this.loadJSONFileSync = null;

}

TranslationsManager.prototype = {

    constructor: TranslationsManager

};

// ***** Common interface (browser / Node) *****

TranslationsManager.prototype.addTranslation = function( translation ) {

    // See en-volumiz3r.json for translation JSON file format.

    if ( ! objectUtils.isObject( translation ) ||
         ! translation.language ||
         ! translation.languageAbbreviation ||
         ! translation.categories ) {
        this.log( "Error: translation is invalid, ignored." );
        return false;
    }

    if ( this.findTranslation( translation.languageAbbreviation ) ) {
        this.log( "Warning: Language already added, ignored: " + translation.languageAbbreviation );
        return false;
    }

    this.translations.push( translation );

    this.useTranslation( translation );

    return true;

};

TranslationsManager.prototype.removeTranslation = function( translation ) {

    var index = this.translations.indexOf( translation );

    if ( index >= 0 ) {

        this.translations.splice( index, 1 );

    }

};

TranslationsManager.prototype.addTranslationsArray = function( translations ) {

    for ( var ti = 0, tn = translations.length; ti < tn; ti++ ) {

        this.addTranslation( translations[ ti ] );

    }

};

TranslationsManager.prototype.findTranslation = function( languageAbbreviation ) {

    for ( var i = 0, n = this.translations.length; i < n; i++ ) {

        var translation = this.translations[ i ];

        if ( translation.languageAbbreviation === languageAbbreviation ) {
            return translation;
        }

    }

    return null;

};


TranslationsManager.prototype.useTranslation = function( translation ) {

    if ( ! translation ) {
        this.log( "Error: translation not found." );
    }

    this.currentTranslation = translation;

};

// ***** Interface for browser only *****

// ***** Interface for Node only *****

TranslationsManager.prototype.setTranslationsPath = function( translationsPath ) {

    this.translationsPath = translationsPath;

};

TranslationsManager.prototype.loadTranslation = function( languageAbbreviation ) {
    
    // Only for node
    
    if ( ! this.pathJoin ) {
        this.pathJoin = require( 'path' ).join;
    }

    if ( ! this.loadJSONFileSync ) {
        this.loadJSONFileSync = require( "../fileUtils/fileUtils.js" ).loadJSONFileSync;
    }

    var translationPath = this.pathJoin( __dirname, this.translationsPath, languageAbbreviation + ".json" );

    var translation = this.loadJSONFileSync( translationPath );

    if ( ! translation ) {
        this.log( "Error while loading translation file in: " + translationPath );
        return null;
    }
    
    this.addTranslation( translation );
    
    return translation;

};
