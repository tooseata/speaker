## Initial Seed for Speaker
* Yeoman scaffold out a AngularJS project
* Using grunt, bower, karma ...

### To install
* clone down repo 
* ```npm install``` in root dir
* If you don't have Bower/Grunt command line tool installed do: ```npm install -g yo grunt-cli bower```
* Then, ```grunt server``` runs the app on port 9000.
* LiveReload should automatically update the app as changes are made.

If you have port conflicts running grunt try the following: 
* ```lsof -iTCP:35729```
* ```kill -9 PID#```
* Run again

## Run Server
* On root level type ```npm start```
