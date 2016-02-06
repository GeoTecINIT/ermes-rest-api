'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var _ = require('underscore');
//var ProductModel = mongoose.model("Agrochemical");
//var ProductName = "agrochemical";
//var ProductCollection = "agrochemicals";
var Config = require('../../helpers/config');

module.exports = function()
{
    router.get('/:parcelId', function(req, res){
        var parcelId = req.params.parcelId;
        var limit = req.query.limit;
        var user = req.ERMES.user;

        var parcel = _.find(user.parcels, (parcel) => parcel.parcelId === parcelId);

        if(_.isUndefined(limit)) {
            limit = 1;
        }

        if(limit <= 0 || limit > 9999) {
            res.jsonp({error: "Limit not valid, must be from 0 to 9999"});
            return;
        }

        // All the products
        var response = _.pick(parcel, Config.allLocalProducts);

        _.mapObject(response, (value, key) => {
            if(!_.isArray(value))
                return;

            // Sort by uploadingdate
            response[key] =_.chain(response[key])
                                .sortBy((product) => Date.parse(product.uploadingDate) * -1) // Sorcery, by date descending.
                                .first(limit)
                                .value();
        });

        parcel = {
            parcelId: parcelId
        };
        _.mapObject(response, (value, key) => {
           if(!_.isArray(value))
               return;
            parcel[key] = _.map(response[key], (product) => product._id);
        });
        response.parcel = parcel;


        res.jsonp(response);
    });

    return router;
}