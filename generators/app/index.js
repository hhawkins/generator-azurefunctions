﻿'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var request = require('request');
var requestPromise = require('request-promise');
var fs = require('fs');
var path = require('path');
var languages = require ('./languages.js');
var languagesJSON = require('./languages.json');
var eventTypesJson = require('./eventTypes.json');
// var templatesJSON = {};

// Use this json file for sorting through templates
// https://ahmelsayed.blob.core.windows.net/public/templates.json
// Chrome extension JSONView makes it easier to see it
// https://chrome.google.com/webstore/detail/jsonview/chklaanhfefbnpoihckbnefhakgolnmc?hl=en

// Setting up constants for the menu items
const ALL_TEMPLATES = 'List all templates',
  TEMPLATES_BY_LANG = 'List templates by language',
  TEMPLATES_BY_EVENT_TYPE = 'List templates by type';

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.red('Azure Functions') + ' generator!'
    ));

    var prompts = [{
      type: 'rawlist',
      name: 'requestFunctionTemplates',
      message: 'Select an option...',
      choices: [ALL_TEMPLATES, TEMPLATES_BY_LANG, TEMPLATES_BY_EVENT_TYPE],
      default: ALL_TEMPLATES
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

    //------------------------------
    //------------------------------
    // This is if the answer is to list all the available templates...
    //------------------------------
    //------------------------------
    if (this.answer.requestFunctionTemplates == ALL_TEMPLATES) {
      var listOfTemplates = [];
      var listOfUrls = {};

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

          for (let i = 0; i < templates.length; i++) {
            listOfTemplates.push(templates[i].name);
            listOfUrls[listOfTemplates[i]] = templates[i].url;
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
          this._downloadTemplate(this.answer.templateToUse, listOfUrls[this.answer.templateToUse], this.answer.functionName);
        })
        .catch(err => {
          this.log('There was an error in searching for available templates...');
          this.log(err);
        });
    }

    //------------------------------
    //------------------------------
    // List the templates by the available languages
    //------------------------------
    //------------------------------
    if (this.answer.requestFunctionTemplates == TEMPLATES_BY_LANG) {
      // templates.json url
      var templatesUrl = "https://ahmelsayed.blob.core.windows.net/public/templates.json";
      var fileName = "templates.json";
      var templatesJson = {};

      request
          .get(templatesUrl)
          .on('end', () => {
              templatesJson = require(path.resolve('./templates.json'));
              
              // this.log(templatesJson[0]);
              // output:
              // { id: 'BlobTrigger-Batch',
              //   function: { disabled: false, bindings: [ [Object] ] },
              //   metadata:
              //     { name: 'BlobTrigger - Batch',
              //       description: 'A Batch function that will be run whenever a blob is added to a specified container',
              //       defaultFunctionName: 'BlobTriggerBatch',
              //       language: 'Batch',
              //       category: [ 'Experimental' ],
              //       userPrompt: [ 'connection', 'path' ] },
              //   files: { 'run.bat': 'echo OFF\nSET /p input=<%input%\necho Windows Batch script processed blob \'%input%\'' } }

              var sortedTemplatesByLanguage = {};

              for (var i in templatesJson) {
                var tempID = templatesJson[i].id;
                var tempLang = templatesJson[i].metadata.language;

                if (sortedTemplatesByLanguage.hasOwnProperty(tempLang)) {
                  sortedTemplatesByLanguage[tempLang].push(tempID);
                } else {
                  sortedTemplatesByLanguage[tempLang] = new Array(tempID);
                }
              }

              var prompts = [{
                type: 'rawlist',
                name: 'languageChose',
                message: 'Select a language...',
                choices: Object.keys(sortedTemplatesByLanguage),
                default: Object.keys(sortedTemplatesByLanguage)[0]
              }];

              return this.prompt(prompts).then(answer => {
                this.answer = answer;
                this._showRelevantTemplates(sortedTemplatesByLanguage[this.answer.languageChose]);
              });
          })
          .on('error', err => {
            this.log('There was an error when downloading the templates.json file');
          })
          .pipe(fs.createWriteStream(path.resolve('./', fileName)));
    }

    //------------------------------
    //------------------------------
    // List the templates by the different event types
    //------------------------------
    //------------------------------
    if (this.answer.requestFunctionTemplates == TEMPLATES_BY_EVENT_TYPE) {
      this.log('Feature coming soon, just wait on it!');
    }
  },

  _showRelevantTemplates: function(templatesToShow) {
    var options = {
      uri: 'https://api.github.com/repos/Azure/azure-webjobs-sdk-templates/contents/Templates',
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true
    };

    var listOfTemplates = [];
    var listOfUrls = {};

    requestPromise(options)
      .then(templates => {
        for (let i = 0; i < templates.length; i++) {
          let templateName = templates[i]['name'];
          if (templatesToShow.indexOf(templateName) >= 0) {
            listOfTemplates.push(templates[i]['name']);
            listOfUrls[listOfTemplates[i]] = templates[i]['url'];
          }
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
        this._downloadTemplate(this.answer.templateToUse, listOfUrls[this.answer.templateToUse], this.answer.functionName);
      })
      .catch(err => {
        this.log('There was an error in searching for available templates...');
        this.log(err);
      });;
  },
  
  _downloadTemplate: function (templateToUse, urlToUse, functionName, language = "") {
    var languageToUse = language;

    var options = {
      uri: urlToUse,
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true
    };

    this.log('Creating your function ' + functionName + '...');

    requestPromise(options)
      .then(files => {
        var pathToSaveFunction = path.resolve('./', functionName);
        var languageOfTemplate = "";

        fs.mkdir(pathToSaveFunction, err => {
          if (err) {
            if (err.code !== 'EEXIST') {
              throw err;
            }
          }

          this.log('Location for your function:');
          this.log(pathToSaveFunction + '\n');

          var filesToDownload = {};
          for (let i = 0; i < files.length; i++) {
            filesToDownload[files[i].name] = files[i].download_url;
          }

          // Verify language if none is given on function call
          if (language === "") {
            // check metadata.json to verify language
          } else {
            // download the appropriate files
          }


          // for (let i = 0; i < files.length; i++) {
          //   var fileName = files[i]['name'];
          //   var fileUrl = files[i]['download_url'];

          //   if (fileName === "metadata.json") {
          //     request
          //       .get(fileUrl)
          //       .on('end', () => {
          //         // Verify the language of the template
          //         languageOfTemplate = languages.resolveLanguage(path.resolve(pathToSaveFunction, "metadata.json"));
          //         if (languageToUse === "") {
          //           languageToUse = languageOfTemplate;

          //           for (let j = 0; j < files.length; j++) {
          //             var fileName = files[j]['name'];
          //             var fileUrl = files[j]['download_url'];
                      
          //             if (fileName.indexOf(languagesJSON[languageToUse].fileExtension) >= 0) {
          //               request
          //                 .get(fileUrl)
          //                 .on('error', err => {
          //                   this.log('There was an error when downloading the file ' + fileName);
          //                   this.log(err);
          //                 })
          //                 .pipe(fs.createWriteStream(path.resolve(pathToSaveFunction, fileName)));

          //               this.log('Downloading file ' + fileName + ' to:');
          //               this.log(path.resolve(pathToSaveFunction, fileName));
          //             }

          //             if (fileName === "function.json") {
          //               request
          //                 .get(fileUrl)
          //                 .on('error', err => {
          //                   this.log('There was an error when downloading the file ' + fileName);
          //                   this.log(err);
          //                 })
          //                 .pipe(fs.createWriteStream(path.resolve(pathToSaveFunction, fileName)));

          //               this.log('Downloading file ' + fileName + ' to:');
          //               this.log(path.resolve(pathToSaveFunction, fileName));
          //             }  
          //           }
          //         }
          //       })
          //       .on('error', err => {
          //         this.log('There was an error when downloading the file ' + fileName);
          //         this.log(err);
          //       })
          //       .pipe(fs.createWriteStream(path.resolve(pathToSaveFunction, fileName)));
          //   }         
          // }
          
          return 1;
        });
        return this._configureTemplate(pathToSaveFunction);
      })
      .catch(err => {
        this.log('There was an error in searching for the files for the template ' + templateToUse);
        this.log(err);
      });
  },

  _configureTemplate: function(pathOfTemplate) {
    return 1;
  }
});