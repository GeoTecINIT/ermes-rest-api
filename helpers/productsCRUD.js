'use strict';
var mongoose = require("mongoose");
//var IrrigationInfo = mongoose.model("IrrigationInfo");
var ObjectId = mongoose.Types.ObjectId;
var ParcelsHelper = require('./parcelsHelper');
var _ = require('underscore');

module.exports = {
    findProductsByID: function (productName, user, productId) {
        var parcels = _.filter(user.parcels, (parcel) => parcel[productName].length > 0);
        var products = _.map(parcels, (parcel) => parcel[productName]);
        products = _.flatten(products);
        return _.filter(products, (product) => product['_id'].equals(productId));
    },

    updateProductsByID: function (productName, user, productId, newProduct){
        var products = this.findProductsByID(productName, user, productId);

        products.forEach(function(product){
            for (var k in product) {
               if(newProduct[k]) product[k] = newProduct[k];
            }
        });

        user.save();

        return products;
    },

    createProductInUserAndParcel(user, pId, productName, newProduct){
        var parcels = _.filter(user.parcels, (parcel) => parcel.parcelId==pId);
        parcels.forEach(function(parcel){
           parcel[productName].push(newProduct);
        });
    },

    insertDataInNewProduct(newProduct, data){
        for (var k in data) {
            newProduct[k] = data[k];
        }
        return newProduct;
    },

    getProduct(req, productName, productCollection){
        var response = {};
        var user = req.ERMES.user;
        var id = ObjectId(req.params.id);
        var collection = this.findProductsByID(productCollection, user, id);
        if(collection.length>0) {
            response[productName] = collection[0];
        }
        else {
            response = {'error': 'Empty product'};
        }
        return response;
    },

    putProduct(req, productName, productCollection){
        var response = {};
        var user = req.ERMES.user;
        var id = ObjectId(req.params.id);
        var newProduct = req.body[productName];

        var collection = this.updateProductsByID(productCollection, user, id, newProduct)

        if(collection.length>0) {
            response[productName] = collection[0];
        }
        else {
            response = {'error': 'Empty product'};
        }
        return response;
    },

    postProduct(req, productName, productCollection, productModel){

        const product = req.body[productName];

        if (product.parcels.length == 0)
            return {'error': 'No Parcels'};

        if(!ParcelsHelper.areParcelsOwned(req.ERMES.user, product.parcels)) {
            return {'error': 'Parcels Not Owned'};

        }
        if(ParcelsHelper.areParcelsDuplicated(product.parcels)) {
            return {'error': 'Duplicated Parcels'};
        }

        var response = {};
        var user = req.ERMES.user;
        var newProduct = new productModel();
        this.insertDataInNewProduct(newProduct, product);
        _.each(product.parcels, (parcelId) => {this.createProductInUserAndParcel(user, parcelId, productCollection, newProduct);});

        user.save();

        response[productName] = JSON.parse(JSON.stringify(newProduct));
        response[productName].parcels = product.parcels;

        return response;
    }
};
