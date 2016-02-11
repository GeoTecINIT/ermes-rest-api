var express = require('express');
var router = express.Router();
var _ = require('underscore');

const userAttribsToOmit = ['userId', 'password', 'updatedAt', 'createdAt'];


module.exports = function(passport){
    router.post('/', passport.authenticate('basic', {session: false}), function(req, res) {
            var user = _.omit(req.user.get({plain: true}), userAttribsToOmit);
            res.status(200).json({user: user});
    });

    return router;
};