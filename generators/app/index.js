'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var tmp = require('tmp');
var ghdownload = require('github-download');
var Git = require('nodegit');
var simpleGit = require('simple-git');
var fs = require('fs');
var _path = require('path');

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

    return this.prompt(prompts).then(function (answer) {
      // To access answer later use this.answer.(answer you need);
      this.answer = answer;
    }.bind(this));
  },

  writing: function () {
    this.directory(
      this.templatePath('/Templates/'+ this.answer.templateToUse),
      this.destinationPath('/CopiedTemplates/'+ this.answer.templateToUse)
    )

    /*
    this.fs.copy(
      this.templatePath('./Templates/' + this.answer.templateToUse),
      this.destinationPath('./TemplateOutput/' + this.answer.templateToUse)
      // this.answer.templateToUse
    );
    */
  
  },

  install: function () {
    this.installDependencies();
  },

  /*
  _getAzureFunctionsCredentials: function () {
    if (this.answer.requestFunctionTemplates) {
      this.log('Lets check for templates...');

      var prompts = [{
        type: 'input',
        name: 'ResourceGroupName',
        message: 'Please enter your Resource Group Name...',
        validate: function (str) {
          return str.length > 0;
        }
      },  {
        type: 'input',
        name: 'FunctionAppName',
        message: 'Please enter your Function App Name...',
        validate: function (str) {
          return str.length > 0;
        }
      },  {
        type: 'input',
        name: 'SubscriptionId',
        message: 'Please enter your Subscription ID...',
        validate: function (str) {
          return str.length > 0;
        }
      },  {
        type: 'input',
        name: 'ClientId',
        message: 'Please enter your Client ID...',
        validate: function (str) {
          return str.length > 0;
        }
      },  {
        type: 'input',
        name: 'ClientSecret',
        message: 'Please enter your Client Secret...',
        validate: function (str) {
          return str.length > 0;
        }
      },  {
        type: 'input',
        name: 'Domain',
        message: 'Please enter y our Active Directory Domain...',
        validate: function (str) {
          return str.length > 0;
        }
      }];

      return this.prompt(prompts).then(function (answer) {
        // To access answer later use this.answer.(answer you need);
        this.azure_functions_information = answer;
      }.bind(this));
    }
  },
  */

  getAzureFunctionsTemplates: function () {
    if (this.answer.requestFunctionTemplates) {
      var tempDir;
      var tempPath;
      var listOfFolders;

      //simpleGit.then(function(clone('https://github.com/Azure/azure-webjobs-sdk-templates')), './gitcloneTest');

/*
      Git.Clone("https://github.com/Azure/azure-webjobs-sdk-templates", './gitcloneTest')
        .catch(function(err) {
          this.log(err);
        });

      listOfFolders = fs.readdirSync('./gitcloneTest/Templates')
        .catch(function(err) {
          this.log(err);
        })
        .filter(function(file) {
          return fs.statSync(_path.join('./gitcloneTest/Templates', file)).isDirectory();
      });
*/
      //this.log('listOfFolders: ' + listOfFolders);

      tmp.setGracefulCleanup();
      tmp.dir(function _tempDirCreated(err, path, cleanupCallback) {
        if (err) throw err;

        tempPath = _path.resolve(_path.join(_path.resolve(path), 'azure-webjobs-sdk-templates'));
        console.log('path: ' + path);
        console.log('tempPath: ' + tempPath);
        console.log('testing the path: ' + _path.join(_path.resolve(path), 'azure-webjobs-sdk-templates'))
        
        Git.Clone('https://github.com/Azure/azure-webjobs-sdk-templates', tempPath + '/test')
          .then(function() {
              listOfFolders = fs.readdirSync(tempPath + '/Templates').filter(function(file) {
                return fs.statSync(_path.join(_path.resolve(path + '/Templates'), _path.join('azure-webjobs-sdk-templates', file))).isDirectory();
              });
              console.log(listOfFolders);
          });
        

        /*
        console.log(listOfFolders);
        */
      });
    }

    /*
    this.log('The request for ' + this.azure_functions_information.FunctionAppName + ' is complete!');
    return azFunctions.listFunctions('unittesthttp')
      .then(functionListing => {
        console.log(String(functionListing));
    });
    */

    return 1;
  },

  loadTemplatesIntoGenerator: function () {
    var listOfFolders = fs.readdirSync('./gitcloneTest/Templates')
      .filter(function(file) {
        return fs.statSync(_path.join('./gitcloneTest/Templates', file)).isDirectory();
    });

    //this.log('listOfFolders: ' + listOfFolders);

    var prompts = [{
      type: 'rawlist',
      name: 'templateToUse',
      message: 'Select from one of the available templates...',
      choices: listOfFolders,
      default: 0
    }];

    return this.prompt(prompts).then(function (answer) {
      // To access answer later use this.answer.(answer you need);
      this.answer = answer;
    }.bind(this));
  }
});