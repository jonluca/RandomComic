'use es6';

var express = require('express');
var bodyParser = require("body-parser");
var path = require('path');
var generator = require('./utils/generator.js');
var app = express();
var api_wrapper = require('./utils/http_modifier.js');

app.enable('trust proxy');

//Sets up important HTTP protocol settings
api_wrapper(app);

app.use('/RandomComic/', express.static(path.join(__dirname, 'public')));

app.get("/RandomComic/", function(req, res) {
    res.render("landing.ejs");
});

//Returns a JSON object containing the title, img url, original comic URL, and name of the comic
app.get("/RandomComic/rand", function(req, res) {
    var comic = generator.getComic(function(comic) {
        res.send(comic);
        res.end();
    });
});