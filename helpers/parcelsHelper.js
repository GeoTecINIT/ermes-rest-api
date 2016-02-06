'use strict';
//var mongoose = require("mongoose");
var _ = require('underscore');

module.exports = {
    areParcelsOwned: function (user, parcelsRequested) {
        var ownedParcelsArray = extractParcels(user);
        return _.every(parcelsRequested, (parcelRequested) => _.contains(ownedParcelsArray, parcelRequested));
    },

    areParcelsDuplicated: function (parcels) {
        return _.uniq(parcels).length !== parcels.length;
    }
};

function extractParcels(user){

    return _.map(user.parcels, (parcel) => parcel.parcelId);

}