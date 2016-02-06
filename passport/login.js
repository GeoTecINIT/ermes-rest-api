//This module reacts to the login options and send back a message with the result.

var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport) {
    // Here is defined the login strategy.
    passport.use('login', new LocalStrategy({
            passReqToCallback: true
        },
        function (req, username, password, done) {
            //Check if the user exists.
            User.findOne({"username": username},
                function (err, user) {
                    //If error, return with the method DONE.
                    if (err) {
                        console.log("error");
                        return done(err);
                    }
                    //Username does not exists, log error and go back.
                    if (!user) {
                        console.log("Not exists: "+ username);
                        return done(null, false);
                    }
                    // User exists, password missmatch, log error and go back.
                    if (!isValidPassword(user, password)) {
                        console.log("password wrong: "+ username);
                        return done(null, false);
                    }
                    if(!user.activeAccount){
                        console.log("Account Not Actived: "+ username);
                        return done(null, false);
                    }
                    //All works fine.
                    console.log(user);
                    return done(null, user);
                }
            );
        }));

    var isValidPassword = function (user, password) {
        return bCrypt.compareSync(password, user.password);
    }
}