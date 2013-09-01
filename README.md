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

_If you have port conflicts when running grunt try the following:_
* ```lsof -iTCP:35729``` lists all processes using port 35729 (the default LiveReload port)
* ```kill -9 PID#``` kills process at given ID#
* Run grunt again.


### [Site](http://192.241.231.123/) on Digital Ocean

Forever keeps Node app running. Check with: ```$ forever list```

Check that Node is running: ```$ ps axl | grep node```

Upstart deamonizes Nginx e.g. turns it into background process. Config file located at /etc/init/nginx.conf

Verify that Nginx daemon is running: ```$ initctl list | grep nginx```

Verifies that nginx is running: ```$ ps aux | grep nginx ```

Check which port nginx is on: ```$ netstat -tulpn ```

Monit for monitoring

```$ monit -d 60 -c /etc/monit/monitrc```
