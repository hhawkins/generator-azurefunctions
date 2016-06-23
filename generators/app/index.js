'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var request = require('request');
var requestPromise = require('request-promise');
var fs = require('fs');
var path = require('path');

module.exports = yeoman.Base.extend({ 
  prompting: function () { 
    // Have Yeoman greet the user. 
    this.log(yosay( 
      'Welcome to the ' + chalk.red('Azure Functions') + ' generator!' 
    )); 

    var prompts = [{ 
      type: 'confirm', 
      name: 'requestFunctionTemplates', 
      message: 'Would you like to see the available templates?', 
      default: true 
    }]; 


    return this.prompt(prompts).then(answer => { 
      // To access answer later use this.answer.(answer you need); 
      this.answer = answer; 
    }); 
  }, 

  configuring: function () {
    /*
    Notes:

    1. Fetch Templates url for list of templates
    https://api.github.com/repos/Azure/azure-webjobs-sdk-templates/contents/Templates
    2. Parse url json to get list of templates
    3. Put list into prompts and ask user which template to download
    4. Download the requested Template!

    Steps to download the template files:
    1. Use request promise to get the right download url
    2. Match the chosen template with the right url
    3. Download the files to the current directory!
    */

    if (this.answer.requestFunctionTemplates) {
      var listOfTemplates = [];
      var listOfUrls = [];

      var options = {
        uri: 'https://api.github.com/repos/Azure/azure-webjobs-sdk-templates/contents/Templates',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
      };

      requestPromise(options)
        .then(templates => {
          this.log('There are %d templates available', templates.length);

          for (let i = 0; i < templates.length; i ++) {
            listOfTemplates[i] = templates[i]['name'];
            listOfUrls[listOfTemplates[i]] = templates[i]['url'];
          }

          var prompts = [{
            type: 'list',
            name: 'templateToUse',
            message: 'Select from one of the available templates...',
            choices: listOfTemplates,
            default: 0
          }, {
            type: 'input',
            name: 'functionName',
            message: 'Enter a name for your function...',
            default: 'MyAzureFunction'
          }];

          return this.prompt(prompts).then(answer => {
            this.answer = answer;
          });
        })
        .then(() => {
          this._downloadTemplate(this.answer.templateToUse, listOfUrls, this.answer.functionName);
        })
        .catch(err => {
          this.log('There was an error in searching for available templates...');
          this.log(err);
        })
    }
  },

  _downloadTemplate: function (templateToUse, listOfUrls, functionName) {
    var options = {
      uri: listOfUrls[templateToUse],
      headers: {
          'User-Agent': 'Request-Promise'
      },
      json: true
    };

    this.log('Creating your function ' + functionName + '...');
    
    requestPromise(options)
      .then(files => {
        var pathToSaveFunction = path.resolve('./', functionName);


        fs.mkdir(pathToSaveFunction, err => {
          if (err) {
            if (err.code != 'EEXIST') {
              throw err;
            }
          }

          this.log('Location for your function:');
          this.log(pathToSaveFunction);

          for (let i = 0; i < files.length; i ++) {
            var fileName = files[i]['name'];
            var fileUrl = files[i]['download_url'];
            request
              .get(fileUrl)
              .on('error', err => {
                this.log('There was an error when downloading the file ' + fileName);
                this.log(err);
              })
              .pipe(fs.createWriteStream(path.resolve(pathToSaveFunction, fileName)));

            this.log('Downloading file ' + fileName + ' to:');
            this.log(path.resolve(pathToSaveFunction, fileName));
          }

          return 1;
        });
        return this._configureTemplate(pathToSaveFunction);
      })
      .catch(err => {
        this.log('There was an error in searching for the files for the template ' + templateToUse);
        this.log(err);
      })
  },

  _configureTemplate: function(pathOfTemplate) {
    this.log('Configuring Template...');
    this.log('In path:');
    this.log(pathOfTemplate);

    var functionJSON = JSON.parse(fs.readFileSync(path.resolve(pathOfTemplate,'function.json'), 'utf8').trim());
    var metadataJSON = JSON.parse(fs.readFileSync(path.resolve(pathOfTemplate,'metadata.json'), 'utf8').trim());

    // // Find the matching userPrompt and bindings values to ask the user to change
    // var valuesToChange = [];

    // for (let i in metadataJSON['userPrompt']) {

    // }

    this.log(functionJSON['bindings']);
    this.log(metadataJSON['userPrompt']);

    return 1;
  }
});