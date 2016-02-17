var express = require('express');
var router = express.Router();
var _ = require('underscore');

const userAttribsToOmit = ['userId', 'password', 'updatedAt', 'createdAt'];


module.exports = function(passport){

    router.post('/', function(req, res) {
      passport.authenticate('login', function(err, user, info) {
        if (!user) {
          res.status(401).json(({errors: [{type: "Error", message: /error_description="(.+)"/.exec(info)[1]}]}));
        } else {
          var plainUser = _.omit(user.get({plain: true}), userAttribsToOmit);
          res.status(200).json({user: plainUser});
        }
      })(req, res);
    });

    return router;
};