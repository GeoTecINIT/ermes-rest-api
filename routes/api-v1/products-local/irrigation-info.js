'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var ProductModel = mongoose.model("IrrigationInfo");
var ProductName = "irrigation";
var ProductCollection = "irrigationInfos";
//var ObjectId = mongoose.Types.ObjectId;
var ProductsCRUD = require('../../../helpers/productsCRUD');

module.exports = function()
{
    router.get('/:id', function(req, res){
        var response = ProductsCRUD.getProduct(req, ProductName, ProductCollection);
        res.jsonp(response);
    });

    router.put('/:id', function(req, res){
        var response = ProductsCRUD.putProduct(req, ProductName, ProductCollection);
        res.jsonp(response);
    });

    router.post('/', function(req, res){
        var response = ProductsCRUD.postProduct(req, ProductName, ProductCollection, ProductModel)
        res.jsonp(response);
    });

    return router;

}

    //var response = {
    //    "irrigation": {}
    //};
    //var user = req.ERMES.user;
    //
    //var newProduct = new IrrigationInfo();
    //
    //ProductsCRUD.insertDataInNewProduct(newProduct, req.body.irrigation);
    //req.body.irrigation.parcels.forEach(function(parcelId)
    //{
    //    ProductsCRUD.createProductInUserAndParcel(user, parcelId, 'irrigationInfos', newProduct);
    //});
    //user.save();
    //
    //response.irrigation = JSON.parse(JSON.stringify(newProduct));
    //response.irrigation.parcels = req.body.irrigation.parcels;

    //var response = {"irrigation": {}};
    //var user = req.ERMES.user;
    //var id = ObjectId(req.params.id);
    //var newProduct = req.body.irrigation;
    //
    //var irrigations = ProductsCRUD.updateProductsByID('irrigationInfos', user, id, newProduct)
    //
    //if(irrigations.length>0) {
    //    response.irrigation = irrigations[0];
    //}
    //else {
    //    response = {'error': 'Empty product'};
    //}


    //var response = {"irrigation": {}};
    //var user = req.ERMES.user;
    //var id = ObjectId(req.params.id);
    //var irrigations = ProductsCRUD.findProductsByID("irrigationInfos", user, id);
    //if(irrigations.length>0) {
    //    response.irrigation = irrigations[0];
    //}


    //else {
    //    response = {'error': 'Empty product'};
    //}
    //router.get('/:id', function(req, res){
    //    var user = req.ERMES.user;
    //    var id = ObjectId(req.params.id);
    //
    //    var agrochemicals = productsByID("agrochemicals", user, id);
    //
    //    //var parcels = user.parcels.filter(function(parcel){
    //    //    if(parcel.agrochemicals.length>0){
    //    //        return true;
    //    //    }
    //    //});
    //
    //    //var parcels = _.filter(user.parcels, (parcel) => parcel.agrochemicals.length > 0);
    //    //
    //    //var agrochemicals = _.map(parcels, (parcel) => parcel.agrochemicals);
    //    //
    //    //var agrochemicals = _.flatten(agrochemicals);
    //    //
    //    //var myIrrigationInfos = _.filter(agrochemicals, (irrigationInfo) => irrigationInfo['_id'].equals(id));
    //
    //    res.send(agrochemicals[0]);
    //
    //    //
    //    //var agrochemicals = [];
    //    //parcels.forEach(function(parcel){
    //    //    var partialResult = parcel.agrochemicals.filter(function(irrigationInfo){
    //    //        if(irrigationInfo['_id'].equals(id)) {
    //    //            return true;
    //    //        }
    //    //    });
    //    //    if(partialResult.length>0){
    //    //        agrochemicals.push(partialResult[0]);
    //    //    }
    //    //});
    //    //agrochemicals.forEach(function(irrigation){
    //    //    irrigation.waterDepth = 9;
    //    //})
    //    //user.save();
    //
    //    //res.send(agrochemicals[0]);
    //
    //
    //
    //});
    //
    //



