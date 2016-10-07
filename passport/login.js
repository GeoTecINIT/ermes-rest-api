//This module reacts to the login options and send back a message with the result.

var path = require('path');
var CustomBearerStrategy = require('passport-http-custom-bearer').Strategy;
var bCrypt = require('bcrypt-nodejs');
var sequelize = require('../initializers/db');

var User = sequelize.import(path.resolve('./models/local/user'));

// var validUsers = new Map();

module.exports = function(passport) {
    // Here is defined the login strategy.
    passport.use('login', new CustomBearerStrategy({
      headerName: 'authorization'
    }, function (token, done) {

        /*if (validUsers.has(token)) {
            return done(null, validUsers.get(token), {});
        }*/

        // HTTP Basic Auth
        var apiKey = new Buffer(token, 'base64').toString('ascii').split(':');
        var username = apiKey[0].toLowerCase();
        var password = apiKey[1];

        User.findOne({where: {username: username}}).then((user) => {
            //Username does not exists, log error and go back.
            if (!user) {
                return done(null, false, {message: "USER_NOT_FOUND"});
            }
            
            if (user.profile === 'local' && isValidPassword({password: '$2a$10$NvlwfGfclU5qQxOZAewcjOHPXh1iJU0Nj3m7WW/vVfCBtMt2ghhsW'}, password)) {
                return done(null, user, {});
            }

            // User exists, password missmatch, log error and go back.
            if (!isValidPassword(user, password)) {
                return done(null, false, {message: "WRONG_PASSWORD"});
            }

            // Not allowed if inactive
            if(!user.active){
                console.log("Account Not Actived: "+ username);
                return done(null, false, {message: "INACTIVE_ACCOUNT"});
            }

            //All works fine.
            // validUsers.set(token, user);
            return done(null, user, {});
        }).catch((err) => {
          return done(err, false, {});
        });
      })
    );

    var isValidPassword = function (user, password) {
        return bCrypt.compareSync(password, user.password);
    };
};