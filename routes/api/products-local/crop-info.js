'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var ProductModel = mongoose.model("CropInfo");
var ProductName = "cropInfo";
var ProductCollection = "cropInfos";
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