## Initial Seed for Speaker
* Yeoman scaffold out a AngularJS project
* Using grunt, bower, karma ...

### To install
* clone down repo 
* ```npm install``` in root dir
* If you don't have bower installed do: ```npm install -g yo grunt-cli bower```
* Run the server on Port 9000 ```grunt server```

If you have port conflicts running grunt try the following: 
* ```lsof -iTCP:35729```
* ```kill -9``` PID#
* Run again