//This module reacts to the login options and send back a message with the result.

var path = require('path');
var BasicStrategy = require('passport-http').BasicStrategy;
var bCrypt = require('bcrypt-nodejs');
var sequelize = require('../initializers/db');

var User = sequelize.import(path.resolve('./models/local/user'));


module.exports = function(passport) {
    // Here is defined the login strategy.
    passport.use(new BasicStrategy(
        function (username, password, done) {
            //Check if the user exists.
            User.findOne({where: {username: username}}).then((user) => {
                    //Username does not exists, log error and go back.
                    if (!user) {
                        return done(new Error("USER_NOT_FOUND"), false);
                    }
                    // User exists, password missmatch, log error and go back.
                    if (!isValidPassword(user, password)) {
                        return done(new Error("WRONG_PASSWORD"), false);
                    }
                    /*if(!user.activeAccount){
                        console.log("Account Not Actived: "+ username);
                        return done(new Error("INACTIVE_ACCOUNT"), false);
                    }*/
                    //All works fine.
                    return done(null, user);
            }).catch((err) => {
              return done(err);
            });
        })
    );

    var isValidPassword = function (user, password) {
        return bCrypt.compareSync(password, user.password);
    };
};