'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var tmp = require('tmp');
var Git = require('nodegit');
var fs = require('fs');
var _path = require('path');
var dir = require('node-dir');
var tempPath;

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

  configuring: function () {
    if (this.answer.requestFunctionTemplates) {
      var done = this.async();
      tmp.setGracefulCleanup();
      tmp.dir(function _tempDirCreated(err, path, cleanupCallback) {
        if (err) throw err;

        tempPath = _path.resolve(_path.join(path, 'azure-webjobs-sdk-templates'));
        Git.Clone('https://github.com/Azure/azure-webjobs-sdk-templates', tempPath)
          .then(console.log('tempPath: ' + tempPath));
      });

      return this._testLocally(done);
    } else {
     return 1;
    }
  },

  _testLocally: function (done) {

      console.log("test lovally");
    return Git.Clone('https://github.com/Azure/azure-webjobs-sdk-templates', '/CopiedTemplates')
    .then(function() {
      var list = fs.readdirSync('./Templates');
      console.log(list);
      var prompts = [{
          type: 'rawlist',
          name: 'templateToUse',
          message: 'Select from one of the available templates...',
          choices: list,
          default: 0
      }];
      console.log("in second then");
    return this.prompt(prompts).then(function (answer) {
      // To access answer later use this.answer.(answer you need);
      console.log("in prompt");
      this.answer = answer;
      done();
      }.bind(this))
    });
  },

  writing: function () {
    this.directory(
      this.templatePath(tempPath + '/Templates/'+ this.answer.templateToUse),
      this.destinationPath('/CopiedTemplates/'+ this.answer.templateToUse)
    )

    this.log('tempPath: ' + tempPath);
  },

  install: function () {
    this.installDependencies();
  }
});