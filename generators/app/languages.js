'use strict';
var languagesJSON = require('./languages.json');
var jsonfile = require('jsonfile');
var request = require('request');
var path = require('path');
var fs = require('fs');

this.getCurrentTemplatesByLanguage = function () {
    var _this = this;
    // templates.json url
    var templatesUrl = "https://ahmelsayed.blob.core.windows.net/public/templates.json";
    var fileName = "templates.json";
    request
        .get(templatesUrl)
        .on('end', function () {
        _this.templatesJson = require(path.resolve('./templates.json'));
        console.log('found template.json');
    })
        .on('error', function (err) {
        console.log('There was an error when downloading the templates.json file');
    })
        .pipe(fs.createWriteStream(path.resolve('./', fileName)));
};

this.resolveLanguage = function (jsonFilePath) {
    // Load the json file
    var metadataJson = jsonfile.readFileSync(jsonFilePath);
    // Return the language
    return metadataJson['language'];
};

this.resolveLanguageIdentifier = function (language) {
    var tempIdentifier = "";
    // Return the determined Identifier
    switch (language) {
        case "Javascript":
            tempIdentifier = "NodeJS";
            break;
        case "C#":
            tempIdentifier = "CSharp";
            break;
        case "Python":
            tempIdentifier = "Python";
            break;
        case "PowerShell":
            tempIdentifier = "Powershell";
            break;
        case "Batch":
            tempIdentifier = "Batch";
            break;
        case "Bash":
            tempIdentifier = "Bash";
            break;
    }
    return tempIdentifier;
};