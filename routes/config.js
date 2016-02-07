"use strict";
var express = require('express');
var router = express.Router();
var _  = require('underscore');


var profiles = require('../user-config-files/profiles.json');
var options = require('../user-config-files/configOptions.json');
var operationalLayers = require('../user-config-files/operationalLayers.json');
var products = require('../user-config-files/products.json');
var parcelLayers = require('../user-config-files/parcelLayers.json');



module.exports = function()
{

    router.post('/', function(req, res){
        var profileId = req.body.profileId;
        var configFile = {};

        var profile = _.find(profiles, (profile) => profileId == profile.profileId);
        configFile.finder = profile.parcelFinder;

        configFile.mapOptions = _.find(options, (option)=> option.idOption == profile.configId).mapOptions;
        configFile.limits = _.find(options, (option)=> option.idOption == profile.configId).limits;

        configFile.parcelsLayer = _.find(parcelLayers, (parcelLayer) => parcelLayer.regionId == profile.region).parcelsLayer;

        var productsList = _.find(products, (productsList) => productsList.region == profile.region).products;
        configFile.mosaics = _.filter(productsList, (product) => _.contains(profile.products, parseInt(product.configId)));

        var operationalList = _.find(operationalLayers, (operationalLayer) => operationalLayer.regionId == profile.region).operationalLayers;
        configFile.layers = _.filter(operationalList, (layer) => _.contains(profile.operationalLayers, parseInt(layer.configId)));

        res.jsonp(configFile);
    });



    return router;
};
