var path = require('path');
var express = require('express');
var router = express.Router();
var _ = require('underscore');
var sequelize = require('../initializers/db');

var User = sequelize.import(path.resolve('./models/user'));
var bCrypt = require('bcrypt-nodejs');

module.exports = function()
{

    // Todo disable this
    router.get('/users', function(req, res) {
        User.findAll({include: [{all: true}]}).then((users) => {
            res.json({users: users});
        });
    });

    // User creation, no auth is needed -> A.K.A Signup
    router.post('/users', function (req, res) {
        sequelize.transaction((t) => {
            return User.create(req.body.user, {transaction: t}).then((user) => {
                var owner;
                if (!(owner = req.body.user.collaboratesWith)) {
                    return user;
                } else if (user.type === "owner") {
                    throw new Error("An owner cannot collaborate");
                } else {
                    return User.findOne({where: {username: { $like: owner.toLowerCase()}}},
                      {transaction: t}).then((owner) => {
                        if (owner) {
                            if (owner.type === 'owner') {
                                return user.setOwners([owner], {transaction: t}).then(() => {
                                    return user;
                                });
                            } else  {
                                throw new Error('Owner specified is not valid');
                            }
                        } else {
                            throw new Error('Owner does not exist');
                        }
                    });
                }
            });
        }).then((user) => {
            res.status(201).json({err: false, user: _.omit(user.get({plain: true}), ['userId', 'password', 'updatedAt', 'createdAt']) });
        }).catch((ex) => {
            console.error('ERROR CREATING USER: ' + ex);
            //res.type('text/plain');
            res.status(200).json({err: true, content: {name: ex.name, msg: ex.message}});
        });
    });

    /*router.use(function(req, res, next){
        req.ERMES = {};
        if(req.header("X-Auth-Key")) {
            var apiKey = req.header("X-Auth-Key");

            var username = apiKey.split(';')[0];
            var password = apiKey.split(';')[1];
            User.findOne({'username': username}, function (err, user) {
                if (err) {
                    res.status(500).send(err.message);
                }
                else if (!user) {
                    res.status(401).send("User not found.");
                }
                else if (user) {

                    if (!isValidPassword(user, password)) {
                        res.status(401).send("Password Wrong.");
                    }
                    else {
                        req.ERMES.user = user;
                        next();
                    }
                }
            });
        }
        else{
            res.status(403).send("Forbidden Access");
        }
    });

    // TODO enable
    //var warm = require('./api-v1/warm');
    //router.use('/warm', warm());

    var users = require("./api-v1/users");
    router.use("/users", users());

    // TODO enable
    //var products = require("./api-v1/products");
    //router.use("/products", products());

    // TODO enable
    //var parcel = require("./api-v1/parcel");
    //router.use("/parcels", parcel());

    // TODO handle routing to product image files
    //var uploads = require("./api-v1/uploads")();
    //router.use("/uploads", uploads);*/

    return router;
};

function isValidPassword(user, password) {
    return bCrypt.compareSync(password, user.password);
}
