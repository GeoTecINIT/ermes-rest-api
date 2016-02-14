require('app-module-path').addPath(__dirname);
//Imports
var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    os = require('os'),
    //multer  = require('multer'),
    sequelize = require('./initializers/db'),
    config = require('./config/environment'),
    cors = require('cors');

console.log('\n# ERMES API server');
console.log('\t* Booting up...');

//Shows JSON pretty.
app.set('json spaces', 3);

// Enable JSON parse on request body
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

/*
app.use(multer({
    dest: './uploads/'
    //onFileUploadComplete: function(file, req, res) {
    //    console.log("FILEEEE: " + file);
    //}
}));*/

// Initialize Passport
app.use(passport.initialize());
var initPassport = require('./passport/init');
initPassport(passport);

// Enable cross origin requests for the whole APP
app.use(cors());

console.log('\t* Connecting to the DB...');
module.exports = sequelize.initModels({force: process.env.VOLATILE_DB ? true : false}).then(() => {
    "use strict";

    var root = require('./router');
    app.use('/', root(passport));

    // Custom 404 page
    app.use(function (req, res) {
        res.type('text/plain');
        res.status(404).send('404 - Not Found');
        console.log('Requested resource:', req.url, '- Not Available');
    });

    // Custom 500 page
    app.use(function (err, req, res, next) {
        console.log('Requested resource:', req.url, '- Server Error');
        console.error(err.stack);
        res.type('text/plain');
        res.status(500).send('500 - Internal server error');
    });

    //Start to listen.
    return app.listen(config.http.PORT, function() {
        console.log('\n** Server up! **\n');
        console.log('Express started on http://' + os.hostname() + ':' + config.http.PORT + '; Press Ctrl-C to terminate');
    });
});