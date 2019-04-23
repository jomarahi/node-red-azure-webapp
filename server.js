//jshint esversion:6
var express = require("express");
var RED = require('node-red');
var passport = require('passport');
const HeaderAPIKeyStrategy = require('passport-headerapikey').HeaderAPIKeyStrategy

var app = express();
var http = require('http');

passport.use(new HeaderAPIKeyStrategy(
  { header: 'Authorization', prefix: 'Bearer ' },
  false,
  function (apikey, done) {
    var api_key = process.env.API_KEY || "testkey"
    if (apikey ===  api_key) {
      return done(null, true)
    } else {
      return done("error")
    }
  }
));

const PORT = process.env.PORT || 8000;

var server = http.createServer(app);
var settings = require("./settings.js");

app.use("/api", passport.authenticate('headerapikey', { session: false }), function (req, res, next) {
  next();
})

//For lokal test 
settings.adminAuth.users[0].password = process.env.NODERED_ADMIN_PASSWORD || '$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN.'

RED.init(server, settings);

app.use(settings.httpAdminRoot, RED.httpAdmin);
app.use(settings.httpNodeRoot, RED.httpNode);

server.listen(settings.uiPort);
console.log(`listening port:${settings.uiPort}`);
RED.start();

