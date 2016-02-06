'use strict';
var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Parcel = mongoose.model("Parcel");
var _ = require('underscore');

module.exports = function()
{

    router.get('/:username', function(req, res){
        var user = req.ERMES.user;
        if(user.username!=req.params.username){
            res.status(403).jsonp({'error': 'Forbidden Access'});
        }
        else {
            var responseParcels = [];
            var userParcels = user.parcels;
            for (var j = 0; j < userParcels.length; j++) {
                responseParcels.push(userParcels[j].parcelId);
            }

            var newUser = user.toObject();
            newUser.parcels = responseParcels;

            delete newUser.password;
            delete newUser["__v"];
            delete newUser["_id"];

            res.status(200).jsonp({'user': newUser});
        }

    });

    router.put('/:username', function(req, res){
        var user = req.ERMES.user;
        if(user.username!=req.params.username){
            res.status(403).jsonp({'error': 'Forbidden Access'});
        }
        else {
            var response = {user: {}};

            var newUserData = req.body.user;

            var listOfAttributesAllowed = ['email', 'profile', 'language', 'lastPosition'];
            var listOfAttributesReturned = ['username', 'email', 'profile', 'region', 'language', 'lastPosition'];

            var attributesToChange = _.pick(newUserData, listOfAttributesAllowed);
            user = _.extend(user, attributesToChange);

            user.save();

            var newParcelsId = newUserData.parcels;
            var oldParcelsId = _.map(user.parcels, (parcel) => parcel.parcelId);

            // Filter user parcels, when they are not in the request parcels
            user.parcels = _.filter(user.parcels, (parcel) => _.contains(newParcelsId, parcel.parcelId));

            // Find out the ids of the parcels that ar enot in user.parcels
            var idsToAdd = _.filter(newParcelsId, (newParcelId) => !_.contains(oldParcelsId, newParcelId));

            _.each(idsToAdd, (id) => {
                var newParcel = new Parcel();
                newParcel.parcelId = id;
                user.parcels.push(newParcel);
            });

            user.save();

            response.user = _.pick(user, listOfAttributesReturned);
            response.user.parcels = _.map(user.parcels, (parcel) => parcel.parcelId);

            res.jsonp(response);
        }

    });

    return router;

}

function manageParcels(userParcels, newParcels){

}