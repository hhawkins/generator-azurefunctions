var languages = require('./languages.json');
var jsonfile = require('jsonfile');

this.resolveLanguage = function (jsonFilePath){
    // Load the json file
    var metadataJson = jsonfile.readFileSync(jsonFilePath);

    // Return the language
    return metadataJson['language'];
}

this.resolveLanguageIdentifier = function (language){
    let tempIdentifier = "";

    // Return the determined Identifier
    switch(language) {
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
}