# speaker.
presentations and media on your mobile device via WebRTC

## Purpose

## Stack
* WebRTC
* Angular
* Node/Express

## Installation
* Clone the repository.
* If you don't have Bower/Grunt command line tool installed, on the command line do: ```npm install -g yo grunt-cli bower```
* Then, ```npm install``` in root dir.
* ```npm start``` starts server. You can then view the app at http://localhost:3000
<!-- * ```grunt watch``` runs testing on port 9000. -->
* If you want live reloading of the app as front end changes are made, run ```grunt server``` (this doesn't start the node server -- so the actual app may not work...?)

_If you have port conflicts when running grunt try the following:_
* ```lsof -iTCP:35729``` lists all processes using port 35729 (the default LiveReload port)
* ```kill -9 PID#``` kills process at given ID#
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

We use Jasmine for testing.

###### Commands:
``` grunt phantom ```

Starts local server on port 3000, continually runs tests with PhantomJS, a a headless browser. Open one or more browsers and point them to [http://localhost:8080/__test/]. Phantom is useful for certain types of tasks, but isn't compatible with WebRTC. Outputs to command line.

Edit ```logLevel``` inside karm.conf.js to ```LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG``` for varying degrees of feedback.

``` grunt chrome ```

Similar to above, but opens a new instance of Chrome that includes a debugger inside the dev tools panel.

Great examples of tests in the repo for Ch. 4 of the Angular O'Reilly book:
[https://github.com/shyamseshadri/angularjs-book/tree/master/chapter4/guthub/test/spec]

#### Server
run ```/etc/init.d/nginx reload```