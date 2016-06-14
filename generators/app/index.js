'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var ghdownload = require('github-download');
var exec = require('exec');
//var AzureFunctions = require('azure-functions')

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
    this.fs.copy(
      this.templatePath('dummyfile.txt'),
      this.destinationPath('dummyfile.txt')
    );
  },

  install: function () {
    this.installDependencies();
  },

  getAzureFunctionsCredentials: function () {
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

  getAzureFunctionsTemplates: function () {
    /*
    var azFunctions = new AzureFunctions(this.azure_functions_information.ResourceGroupName,
    this.azure_functions_information.FunctionAppName, {
        subscriptionId: this.azure_functions_information.SubscriptionId,
        clientId: this.azure_functions_information.ClientId,
        clientSecret: this.azure_functions_information.ClientSecret,
        domain: this.azure_functions_information.Domain
    });

    this.log('The request for ' + this.azure_functions_information.FunctionAppName + ' is complete!');
    return azFunctions.listFunctions('unittesthttp')
      .then(functionListing => {
        console.log(String(functionListing));
    });
    */
  }
});