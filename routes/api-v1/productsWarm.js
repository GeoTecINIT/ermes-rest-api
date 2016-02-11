/**
 * Created by alberto on 7/09/15.
 */
var express = require('express');
var router = express.Router();

var u = require('underscore');
var dbRegion = require('helpers/dbRegion');

var mongoose = require("mongoose");
var User = mongoose.model("User");
var developmentStage = require('controllers/WARM/developmentStage');
var infectionRisk = require('controllers/WARM/infectionRisk');

module.exports = function() {

    router.get('/development-stage', function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var name = req.query.username;
        User.findOne({'username': name}, { _id: 0, parcels: 1 , region: 1}, function (err, user) {
			console.log(user.region);
            if (err) {
                return res.status(500).send(err.message);
            }
            //if (user && u.findWhere(user.parcels, {parcelId: req.query.parcelId})) {
            if (user) {
                developmentStage.get(req, res, dbRegion.getSchema(user.region));
            } else {
                res.status(200).send({error: true, message: "User not found or that parcel is not owned by that user"});
            }
        });
    });

    // TO DO This has to be done in a better way, I'll research for it
    router.get('/infection-risk', function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var name = req.query.username;
        User.findOne({'username': name}, { _id: 0, parcels: 1 , region: 1}, function (err, user) {
            console.log(user.region);
            if (err) {
                return res.status(500).send(err.message);
            }
            //if (user && u.findWhere(user.parcels, {parcelId: req.query.parcelId})) {
            if (user) {
                infectionRisk.get(req, res, dbRegion.getSchema(user.region));
            } else {
                res.status(200).send({error: true, message: "User not found or that parcel is not owned by that user"});
            }
        });
    });

    return router;
};