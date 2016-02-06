var express = require('express');
var router = express.Router();

module.exports = function(passport){
    router.post('/', function(req, res, next) {
        passport.authenticate('login', function(err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                //return res.status(400).send(false);
                return res.send(false);
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                var response= '{"user": "' + user.username +
                    '", "region": "' + user.region  +
                    '", "profile": "' + user.profile  +
                    '", "lang": "' + user.language  +
                    '", "email": "' + user.email  + '"}';
                console.log(response)
                var responseJson = JSON.parse(response);
                res.send(responseJson);
            });
        })(req, res, next);
    });
    return router;
}