'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var ProductModel = mongoose.model("ParcelStatus"); //Model:ParcelStatus is reffered to SoilCondition, needs to be changed when BBDD will change. Same for collection in model.
var ProductName = "soilCondition";
var ProductCollection = "parcelStatus";
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
