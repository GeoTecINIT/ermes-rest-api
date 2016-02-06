require('app-module-path').addPath(__dirname);
//Imports
var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    expressSession = require("express-session"),
    os = require('os'),
    //multer  = require('multer'),
    warmDb = require('./controllers/warmDb'),
    sequelize = require('./initializers/db'),
    config = require('./config/environment'),
    cors = require('cors');

//WARM Setup TODO enable
//warmDb.init();

//Shows JSON pretty.
app.set('json spaces', 3);

// Tools to use in the APP
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

/*
app.use(multer({
    dest: './uploads/'
    //onFileUploadComplete: function(file, req, res) {
    //    console.log("FILEEEE: " + file);
    //}
}));*/

//Code to configure passport. The module to handle the authentication.
app.use(expressSession({ // TODO: Is this really needed?
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

// Enable cross origin requests for the whole APP
app.use(cors());

module.exports = sequelize.initModels({force: process.env.DB_VOLATILE ? true : false}).then(() => {
    "use strict";

    //var root = require('./routes/index')(passport);
    //app.use('/', root);

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
        console.log('Express started on http://' + os.hostname() + ':' + config.http.PORT + '; Press Ctrl-C to terminate');
    });
});