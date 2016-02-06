//Code to serialize and Deserialize User Instances.
// Also it starts "login" and "signup" functionality.
var login = require('./login');
var signup = require('./signup');

var User = require('../models/user');
module.exports = function(passport) {
    passport.serializeUser(function (user, done) {
        console.log('Serializing: ' + user.username);
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            console.log('Deserializing: ' + user.username);
            done(err, user);
        });
    });

    login(passport);
    signup(passport);
}

