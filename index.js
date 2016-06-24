"use strict";

/*
RUN AS:

$ NODE_TLS_REJECT_UNAUTHORIZED=0 nodemon index.js

Edit COOKIE as needed.

Much gratitude to http://www.chovy.com/web-development/self-signed-certs-with-secure-websockets-in-node-js/

To create keys:
$ openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 100 -nodes

Bookmarklet code:
javascript:(function() {
  var o = {
    source : "web submission",
    url : window.location.href,
    title : document.title,
    selection : window.getSelection().toString(),
    isQuote : true
  };
  var ws = new WebSocket('wss://0.0.0.0:8443/');
  ws.onopen = function() { ws.send(JSON.stringify(o)); };
})()

or minified:

!function(){var e={source:"web submission",url:window.location.href,title:document.title,selection:window.getSelection().toString(),isQuote:!0},n=new WebSocket("wss://0.0.0.0:8443/");n.onopen=function(){n.send(JSON.stringify(e))}}();

 */

const COOKIE =
    "connect.sid=s%3AHyENjDUgMlDIYwBAXEayyoRjAfvJ4AcA.2Ry%2Bip%2BxKsI6VqUta7m1qiLGB3OTNcV0FqvkVYhCeTY";
var request = require('request');

var express = require('express');
var app = express();

var fs = require('fs');
var privateKey = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('cert.pem', 'utf8');

var credentials = {key : privateKey, cert : certificate};

var https = require('https');
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(8443);

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({server : httpsServer});

wss.on('connection', function connection(ws) {
  ws.on('message', message => {
    console.log('received: %s', message);
    request(
        {
          method : "POST",
          uri : "https://aldebrn.me:4001/clip",
          json : true,
          body : JSON.parse(message), // FIXME
          headers : {'Cookie' : COOKIE}
        },

        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body) // Show the HTML for the Google homepage.
          } else {
            console.error(error, response, body);
          }
        });
  });

  // ws.send('something');
});
