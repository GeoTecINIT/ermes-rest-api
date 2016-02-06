var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var User = mongoose.model("User");
var bCrypt = require('bcrypt-nodejs');

module.exports = function()
{

    router.use(function(req, res, next){
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
    //var warm = require('./api/warm');
    //router.use('/warm', warm());

    var users = require("./api/users");
    router.use("/users", users());

    var products = require("./api/products");
    router.use("/products", products());

    var parcel = require("./api/parcel");
    router.use("/parcels", parcel());

    // TODO handle routing to product image files
    //var uploads = require("./api/uploads")();
    //router.use("/uploads", uploads);

    return router;
};

function isValidPassword(user, password) {
    return bCrypt.compareSync(password, user.password);
}
