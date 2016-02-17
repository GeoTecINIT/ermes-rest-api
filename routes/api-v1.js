var path = require('path');
var express = require('express');
var router = express.Router();

module.exports = function(passport) {

    var users = require("./api-v1/users");
    router.use("/users", users(passport));

    var parcels = require("./api-v1/parcels");
    router.use("/parcels", passport.authenticate('login', {session: false}), parcels());

    var products = require("./api-v1/productsLocal");
    router.use("/products", passport.authenticate('login', {session: false}), products());

    var warm = require('./api-v1/productsWarm');
    router.use('/warm', passport.authenticate('login', {session: false}), warm());

    // TODO handle routing to product image files
    //var uploads = require("./api-v1/uploads")();
    //router.use("/uploads", passport.authenticate('login', {session: false}), uploads);

    return router;
};
