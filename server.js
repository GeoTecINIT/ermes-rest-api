require('app-module-path').addPath(__dirname);
//Imports
var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    path = require('path'),
    os = require('os'),
    //multer  = require('multer'),
    loggers = require('./initializers/loggers'),
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

    var User = sequelize.import(path.resolve('./models/local/user'));
    User.findAll({where: {type: 'guest'}}).then((guests) => {
      if (guests.length === 0) {
          User.bulkCreate([
              {username: 'guestls', password: 'q1w2e3r4t5y6', region: 'spain', profile: 'local', type: 'guest', email: 'guestls@ermes.com', language: 'es', active: true},
              {username: 'guestli', password: 'q1w2e3r4t5y6', region: 'italy', profile: 'local', type: 'guest', email: 'guestli@ermes.com', language: 'it', active: true},
              {username: 'guestlg', password: 'q1w2e3r4t5y6', region: 'greece', profile: 'local', type: 'guest', email: 'guestlg@ermes.com', language: 'el', active: true},
              {username: 'guestrs', password: 'q1w2e3r4t5y6', region: 'spain', profile: 'regional', type: 'guest', email: 'guestrs@ermes.com', language: 'es', active: true},
              {username: 'guestri', password: 'q1w2e3r4t5y6', region: 'italy', profile: 'regional', type: 'guest', email: 'guestri@ermes.com', language: 'it', active: true},
              {username: 'guestrg', password: 'q1w2e3r4t5y6', region: 'greece', profile: 'regional', type: 'guest', email: 'guestrg@ermes.com', language: 'el', active: true}
          ]);
      }
    });

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
        loggers.error.write('[' + new Date() + ' SERVER ERROR]: ' + JSON.stringify(err) + '\n');
    });

    //Start to listen.
    return app.listen(config.http.PORT, function() {
        console.log('** Server up! **\n');
        console.log('Express started on http://' + os.hostname() + ':' + config.http.PORT + '; Press Ctrl-C to terminate');
    });
});