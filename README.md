# Speaker.
> Presentations and media on your mobile device via WebRTC. Speaker lets your audience collectively vote on questions, then hands winners a virtual microphone to ask them. All in the browser, no extra hardware. It just works.

## Purpose

## Stack
* WebRTC
* Angular
* Node/Express

## Installation
* Clone the repository.
* If you don't have Bower/Grunt command line tool installed, on the command line do: ```npm install -g yo grunt-cli bower```
* Then, ```npm install``` and ```bower install``` in root dir.
* ```npm start``` starts server. You can then view the app at http://localhost:3000


### [Site](http://192.241.231.123/) on Digital Ocean

Forever keeps Node app running. Check with: ```$ forever list```

Verify that Node is running: ```$ ps axl | grep node```

Upstart deamonizes Nginx e.g. turns it into background process. Config file located at ```/etc/init/nginx.conf```

Verify that Nginx daemon is running: ```$ initctl list | grep nginx```

Verifies Nginx process is running: ```$ ps aux | grep nginx ```

Check which port Nginx is on: ```$ netstat -tulpn ```

To check Nginx status remotely, go to http://speak.re/nginx_status

Monit for monitoring: ```$ monit -d 60 -c /etc/monit/monitrc```


