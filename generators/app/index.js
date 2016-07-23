'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var request = require('request');
var requestPromise = require('request-promise');
var fs = require('fs');
var path = require('path');
var filesToExclude = [
    "test.json",
    "readme.md",
    "metadata.json"
];

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
      // templates.json url
      var templatesUrl = "https://ahmelsayed.blob.core.windows.net/public/templates.json";
      var fileName = "templates.json";

      request({uri: templatesUrl, json: true}, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          var allTemplates = [];
          for (var i in body) {
            allTemplates.push(body[i].id);
          }

          this._showRelevantTemplates(allTemplates);
        }
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

      request({uri: templatesUrl, json: true}, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          templatesJson = body;
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

          this.log('There are %d languages available', Object.keys(sortedTemplatesByLanguage).length);

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
        }
      });
    }

    //------------------------------
    //------------------------------
    // List the templates by the different event types
    //------------------------------
    //------------------------------
    if (this.answer.requestFunctionTemplates == TEMPLATES_BY_EVENT_TYPE) {
      // templates.json url
      var templatesUrl = "https://ahmelsayed.blob.core.windows.net/public/templates.json";
      var fileName = "templates.json";
      var templatesJson = {};

      request({uri: templatesUrl, json: true}, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          templatesJson = body;

          var sortedTemplatesByEvent = {};

          for (var i in templatesJson) {
            var tempID = templatesJson[i].id;
            var tempEvent = "";

            if (templatesJson[i]['function'].bindings[0] !== undefined) {
              tempEvent = templatesJson[i]['function'].bindings[0].type;
            } else {
              tempEvent = "empty";
            }

            if (sortedTemplatesByEvent.hasOwnProperty(tempEvent)) {
              sortedTemplatesByEvent[tempEvent].push(tempID);
            } else {
              sortedTemplatesByEvent[tempEvent] = new Array(tempID);
            }
          }

          this.log('There are %d event types available', Object.keys(sortedTemplatesByEvent).length);

          var prompts = [{
            type: 'rawlist',
            name: 'eventChose',
            message: 'Select an event type...',
            choices: Object.keys(sortedTemplatesByEvent),
            default: Object.keys(sortedTemplatesByEvent)[0]
          }];

          return this.prompt(prompts).then(answer => {
            this.answer = answer;
            this._showRelevantTemplates(sortedTemplatesByEvent[this.answer.eventChose]);
          });
        }
      });
    }
  },

  _showRelevantTemplates: function(templatesToShow) {
    var languageToUse = "";

    if (this.answer.languageChose !== undefined) {
      languageToUse = this.answer.languageChose;
    }

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
            listOfUrls[templates[i].name] = templates[i]['url'];
          }
        }

        listOfTemplates = Object.keys(listOfUrls);

        this.log('There are %d templates available', listOfTemplates.length);

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
  
  _downloadTemplate: function (templateToUse, urlToUse, functionName) {

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

        fs.mkdir(pathToSaveFunction, err => {
          if (err) {
            if (err.code !== 'EEXIST') {
              throw err;
            }
          }

          this.log('Location for your function...');
          this.log(pathToSaveFunction);

          var filesInTemplate = {};
          for (let i = 0; i < files.length; i++) {
            filesInTemplate[files[i].name] = files[i].download_url;
          }

          // Function to download the files
          var downloadFiles = function (filesToDownload) {
              for (let file in filesToDownload) {
                request
                  .get(filesToDownload[file])
                  .on('error', err => {
                    this.log('There was an error when downloading the file ' + file);
                    this.log(err);
                  })
                  .pipe(fs.createWriteStream(path.resolve(pathToSaveFunction, file)));
              }
          }.bind(this);

          // gather the files
          var filesToDownload = {};
          for (let file in filesInTemplate) {
            if (filesToExclude.indexOf(file) < 0) {
              filesToDownload[file] = filesInTemplate[file];
            }
          }
            
          // download the files
          downloadFiles(filesToDownload); 

          return 1;
        });
        return 1;
      })
      .catch(err => {
        this.log('There was an error in searching for the files for the template ' + templateToUse);
        this.log(err);
      });
  }
});