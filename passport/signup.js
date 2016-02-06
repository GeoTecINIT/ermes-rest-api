//This module reacts to the register options and send back a message with the result.

var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');
var config = require('helpers/config');

module.exports = function(passport){

    passport.use('signup', new LocalStrategy({
                passReqToCallback : true
            },
            function(req, username, password, done) {

                findOrCreateUser = function(){
                    //Check if the user exists.
                    User.findOne({ 'username' :  username }, function(err, user) {
                        //If error, return with the method DONE.
                        if (err){
                            return done(err);
                        }
                        // Username already exists
                        if (user) {
                            return done(null, false);
                        } else {

                            // If not exists, create the user.
                            var newUser = new User();
                            newUser.username = username;
                            newUser.password = createHash(password);
                            newUser.email = req.body.email;
                            newUser.region = req.body.region;
                            newUser.activeAccount = false;

                            if(!newUser.email || !newUser.region) {
                                return done(null, false);
                            }

                            newUser.language = calculateLanguage(newUser.region);
                            newUser.lastPosition = config.regions[newUser.region];


                            if(!req.body.profile) {
                                newUser.profile = "local";
                            } else {
                                newUser.profile = req.body.profile;
                            }
                            // save the user
                            newUser.save(function(err) {
                                if (err){
                                    throw err;
                                }
                                return done(null, newUser);
                            });
                        }
                    });
                };
                // Delay the execution of findOrCreateUser and execute the method
                // in the next tick of the event loop
                process.nextTick(findOrCreateUser);
            })
    );

    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);

    }

    var calculateLanguage = function(region){
        var regions = {
            'italy': 'it',
            'spain': 'es',
            'greece': 'gk'
        };
        if(!regions[region]) return 'en';
        return regions[region];
    }

}
