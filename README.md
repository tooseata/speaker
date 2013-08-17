# speaker.

## Stack
* WebRTC
* Angular
* Node/Express

## Installation
* Clone the repository.
* If you don't have Bower/Grunt command line tool installed, on the command line do: ```npm install -g yo grunt-cli bower```
* Then, ```npm install``` in root dir.
* ```npm start``` starts server. You can then view the app at http://localhost:3000
* ```grunt server``` runs testing on port 9000.
* LiveReload should automatically update the app as changes are made.
* _If you have port conflicts when running grunt try the following:_
* ```lsof -iTCP:35729```
* ```kill -9 PID#```
* Run grunt again.


## Development

### Folders structure
At the top level, the repository is split into an app folder and a server folder.  The client folder contains all the client-side AngularJS application.  The server folder contains a very basic Express based webserver that delivers and supports the application.
Within the client folder you have the following structure:
* `dist` contains build results
* `src` contains application's sources
* `test` contains test sources, configuration and dependencies
* `server` contains code for a simple Express server written in Node

### Default Build
The default grunt task will build (checks the javascript (lint), runs the unit tests (test:unit) and builds distributable files) and run all unit tests: `grunt` (or `grunt.cmd` on Windows).  The tests are run by karma and need one or more browsers open to actually run the tests.
* `cd app`
* `grunt`
* Open one or more browsers and point them to [http://localhost:8080/__test/].  Once the browsers connect the tests will run and the build will complete.
* If you leave the browsers open at this url then future runs of `grunt` will automatically run the tests against these browsers.

### Continuous Building
The watch grunt task will monitor the source files and run the default build task every time a file changes: `grunt watch`.

### Building release code
You can build a release version of the app, with minified files.  This task will also run the "end to end" (e2e) tests.
The e2e tests require the server to be started and also one or more browsers open to run the tests.  (You can use the same browsers as for the unit tests.)
* `cd app`
* Run `grunt release`
* Open one or more browsers and point them to [http://localhost:8080/__test/].  Once the browsers connect the tests will run and the build will complete.
* If you leave the browsers open at this url then future runs of `grunt` will automatically run the tests against these browsers.

### Continuous testing
You can have grunt (karma) continuously watch for file changes and automatically run all the tests on every change, without rebuilding the distribution files.  This can make the test run faster when you are doing test driven development and don't need to actually run the application itself.

* `cd app`
* Run `grunt test-watch`.
* Open one or more browsers and point them to [http://localhost:8080/__test/].
* Each time a file changes the tests will be run against each browser.

### Initial Seeding
* Yeoman used to scaffold out seed Angular app with Bower, NPM, and Grunt.


