var path = require('path');
var express = require('express');
var router = express.Router();

module.exports = function(passport) {

    var users = require("./api-v1/users");
    router.use("/users", users(passport));

    var parcels = require("./api-v1/parcels");
    router.use("/parcels", passport.authenticate('basic', {session: false}), parcels());

    var products = require("./api-v1/productsLocal");
    router.use("/products", passport.authenticate('basic', {session: false}), products());

    // TODO enable
    //var warm = require('./api-v1/productsWarm');
    //router.use('/warm', passport.authenticate('basic', {session: false}), warm());

    // TODO handle routing to product image files
    //var uploads = require("./api-v1/uploads")();
    //router.use("/uploads", passport.authenticate('basic', {session: false}), uploads);

    return router;
};
