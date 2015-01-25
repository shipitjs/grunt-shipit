# grunt-shipit 

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/shipitjs/grunt-shipit?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/shipitjs/grunt-shipit.svg?branch=master)](https://travis-ci.org/shipitjs/grunt-shipit)
[![Dependency Status](https://david-dm.org/shipitjs/grunt-shipit.svg?theme=shields.io)](https://david-dm.org/shipitjs/grunt-shipit)
[![devDependency Status](https://david-dm.org/shipitjs/grunt-shipit/dev-status.svg?theme=shields.io)](https://david-dm.org/shipitjs/grunt-shipit#info=devDependencies)

![Shipit logo](https://cloud.githubusercontent.com/assets/266302/3756454/81df9f46-182e-11e4-9da6-b2c7a6b84136.png)

Grunt plugin for Shipit, an automation engine and a deployment tool written for node / iojs.

**If you prefer using Shipit without grunt, please go to [Shipit repository](https://github.com/shipitjs/shipit).**

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```sh
npm install grunt-shipit --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-shipit');
```

## Usage

### Example Gruntfile.js

```js
module.exports = function (grunt) {
  grunt.initConfig({
    shipit: {
      options: {
        workspace: '/tmp/github-monitor',
        deployTo: '/tmp/deploy_to',
        repositoryUrl: 'https://github.com/user/repo.git',
        ignores: ['.git', 'node_modules'],
        keepReleases: 2,
        key: '/path/to/key',
        shallowClone: true
      },
      staging: {
        servers: 'user@myserver.com'
      }
    }
  });

  grunt.loadNpmTasks('grunt-shipit');
  grunt.loadNpmTasks('shipit-deploy');

  grunt.registerTask('pwd', function () {
    grunt.shipit.remote('pwd', this.async());
  });
};

```

For more documentation about Shipit commands please refer to [Shipit repository](https://github.com/shipitjs/shipit).

For more documentation about Shipit deploy task, please refer to [Shipit deploy repository](https://github.com/shipitjs/shipit-deploy).

## Upgrading from v0.5.x

### Methods

Now all methods returns promises, you can still use callback but the result has changed.

Before:

```js
shipit.remote('echo "hello"', function (err, stdout, stderr) {
  console.log(stdout, stderr);
});
```

Now:

```js
shipit.remote('echo "hello"', function (err, res) {
  console.log(res.stdout, res.stderr);
});
```

### Deployment task

The deployment task is now separated from Shipit. You must install it and load it separately:

```
npm install shipit-deploy
```

```js
grunt.loadNpmTasks('shipit-deploy');
```

## License

MIT
