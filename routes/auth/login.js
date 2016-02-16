var express = require('express');
var router = express.Router();
var _ = require('underscore');

const userAttribsToOmit = ['userId', 'password', 'updatedAt', 'createdAt'];


module.exports = function(passport){

    router.post('/', function(req, res) {
      passport.authenticate('basic', function(err, user) {
        if (!user) {
          res.status(401).json(({errors: [{type: err.name, message: err.message}]}));
        } else {
          var plainUser = _.omit(user.get({plain: true}), userAttribsToOmit);
          res.status(200).json({user: plainUser});
        }
      })(req, res);
    });

    return router;
};