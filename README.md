# grunt-shipit [![Build Status](https://travis-ci.org/neoziro/grunt-shipit.png?branch=master)](https://travis-ci.org/neoziro/grunt-shipit)

Deploy using grunt task.

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

```
grunt shipit:<stage> <tasks ...>
```

## Shipit task

### Run task

```
grunt shipit:<stage> <tasks ...>
```

### Options

#### workspace

Type: `String`

Define the local working path of the project deployed.

#### deployTo

Type: `String`

Define the remote path where the project will be deployed. A directory `releases` is automatically created. A symlink `current` is linked to the current release.

#### repositoryUrl

Type: `String`

Git URL of the project repository.

#### ignores

Type: `Array<String>`

An array of paths that match ignored files. These paths are used in the rsync command.

#### keepReleases

Type: `String`

Number of release to keep on the remote server.

#### servers

Type: `String` or `Array<String>`

Servers on which the project will be deployed. Pattern must be `user@myserver.com` if user is not specified (`myserver.com`) the default user will be "deploy".

### Usage example

```js
shipit: {
  options: {
    workspace: '/tmp/github-monitor',
    deployTo: '/tmp/deploy_to',
    repositoryUrl: 'https://github.com/user/repo.git',
    ignores: ['.git', 'node_modules'],
    keepReleases: 2
  },
  staging: {
    servers: 'user@myserver.com'
  }
}
```

To deploy on staging, you must use the following command :

```
grunt shipit:staging deploy
```

You can rollback to the previous releases with the command :

```
grunt shipit:staging rollback
```

### Events

Shipit has several events describe in the workflow, you can add custom event and listen to events.

```js
grunt.registerTask('build', function () {
  // ...
  grunt.shipit.emit('buit');
});

grunt.shipit.on('fetched', function () {
  grunt.task.run(['build']);
});

```

### Methods

#### shipit.local(command, [args], [options], callback)

Run a command locally and streams the result.

```js
shipit.local('ls', ['-lah'], { cwd: '/tmp/deploy/workspace' }, function (err, stdout) {
  // ...
});
```

### shipit.remote(command, [args], [options], callback)

Run a command remotely and streams the result.

If you want to run a `sudo` command, the ssh connection will use the TTY mode automatically.

```js
shipit.remote('ls', ['-lah'], function (err, stdout) {
  // ...
});
```

### shipit.remoteCopy(src, dest, callback)

Make a remote copy from a local path to a dest path.

```js
shipit.remoteCopy('/tmp/workspace', '/opt/web/myapp', function (err) {
  // ...
});
```

### Variables

Shipit attach several variables during the deploy and the rollback process :

#### shipit.repository

Attached during `deploy:fetch` task.

You can manipulate the repository using git command, the API is describe in [gift](https://github.com/sentientwaffle/gift).

#### shipit.config.*

All options describe in the config sections are avalaible in the `shipit.config` object.

#### shipit.releaseDirname

Attached during `deploy:update` and `rollback:init` task.

The current release dirname of the project, the format used is "YYYYDDMMHHmmss" (moment format).

#### shipit.releasesPath

Attached during `deploy:update` and `rollback:init` task.

The remote releases path.

#### shipit.releasePath

Attached during `deploy:update` and `rollback:init` task.

The complete release path : `path.join(shipit.releasesPath, shipit.releaseDirname)`.

#### shipit.currentPath

Attached during `deploy:publish` and `rollback:init` task.

The current symlink path : `path.join(shipit.config.deployTo, 'current')`.

## Workflow tasks

- deploy
  - deploy:init
    - Emit event "deploy".
  - deploy:fetch
    - Create workspace.
    - Fetch repository.
    - Checkout commit-ish.
    - Emit event "fetched".
  - deploy:update
    - Create and define release path.
    - Remote copy project.
    - Emit event "updated".
  - deploy:publish
    - Update synonym link.
    - Emit event "published".
  - deploy:clean
    - Remove old releases.
    - Emit event "cleaned".
- rollback
  - rollback:init
    - Define release path.
    - Emit event "rollback".
  - deploy:publish
    - Update synonym link.
    - Emit event "published".
  - deploy:clean
    - Remove old releases.
    - Emit event "cleaned".

## License

MIT