"use strict";
var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var User = mongoose.model("User");
var ParcelsHelper = require('../../helpers/parcelsHelper');

module.exports = function()
{

    //I CANT ACCESS HERE WITHOUT KNOWING THE PRODUCT NAME SO I PUT IT IN productsCRUD
    //router.post('/*', function(req, res, next){
    //    if(!ParcelsHelper.parcelsOwned(req.ERMES.user, req.body.parcels))
    //        res.status(401).send("Parcels Wrong");
    //    else
    //        next();
    //});

    router.use('/:product/:id', function(req, res, next){


        if(req.params.id && !req.params.id.match("^[0-9A-Fa-f]{24}$")){
            res.status(404).send('Wrong Data');
        }
        else{
            next();
        }

    });


    var agrochemical = require("./products-local/agrochemical")();
    router.use("/agrochemicals", agrochemical);

    var cropInfo = require("./products-local/crop-info")();
    router.use("/cropInfos", cropInfo);

    var cropPhenology = require("./products-local/crop-phenology")();
    router.use("/cropPhenologies", cropPhenology);

    var disease = require("./products-local/disease")();
    router.use("/diseases", disease);

    var fertilizer = require("./products-local/fertilizer")();
    router.use("/fertilizers", fertilizer);

    var irrigationInfo = require("./products-local/irrigation-info")();
    router.use("/irrigations", irrigationInfo);

    var observation = require("./products-local/observation")();
    router.use("/observations", observation);

    var pathogen = require("./products-local/pathogen")();
    router.use("/pathogens", pathogen);

    var soilCondition = require("./products-local/soil-condition")();
    router.use("/soilConditions", soilCondition);

    var soilType = require("./products-local/soil-type")();
    router.use("/soilTypes", soilType);

    var weed = require("./products-local/weed")();
    router.use("/weeds", weed);

    var Yield = require("./products-local/yield")(); //yield is not allowed in strict mode.
    router.use("/yields", Yield);

    return router;

}