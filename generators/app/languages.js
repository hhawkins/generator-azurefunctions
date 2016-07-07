var languages = require('./languages.json');
var jsonfile = require('jsonfile');

this.resolveLanguage = function (jsonFilePath){
    // Load the json file
    var metadataJson = jsonfile.readFileSync(jsonFilePath);

    console.log(metadataJson);

    // Return the language
    return metadataJson['language'];
}