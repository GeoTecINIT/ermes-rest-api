var express = require('express');
var router = express.Router();
var path = require('path');

var defaults = require('../../helpers/config');
var _ = require('underscore');
_.mixin(require('underscore.inflections'));
var sequelize = require('../../initializers/db');

var Product = sequelize.import(path.resolve('./models/product'));
var Parcel = sequelize.import(path.resolve('./models/parcel'));
var User = sequelize.import(path.resolve('./models/user'));

const ommitedProductFields = ['createdAt', 'updatedAt', 'id', 'userId', 'type'];

module.exports = function() {

    //I CANT ACCESS HERE WITHOUT KNOWING THE PRODUCT NAME SO I PUT IT IN productsCRUD
    //router.post('/*', function(req, res, next){
    //    if(!ParcelsHelper.parcelsOwned(req.ERMES.user, req.body.parcels))
    //        res.status(401).send("Parcels Wrong");
    //    else
    //        next();
    //});

    // Check if we are offering the product that the client is looking for
    router.use('/:productType', function(req, res, next) {
        if (_.contains(defaults.allLocalProducts, req.params.productType)) {
            req.ERMES.ProductType = sequelize.import(path.resolve('./models/' + _.singularize(req.params.productType)));
            next();
        } else {
            res.type('text/plain');
            res.status(404).send("404 - These aren't the products you're looking for");
            console.log('Requested resource:', req.url, '- Not Available');
        }
    });

    router.post('/:productType', function(req, res) {
        var user = req.ERMES.user;
        var productType = _.singularize(req.params.productType);
        var parcelIds = _.map(req.body[productType].parcels, (parcel) => parcel.toLowerCase());
        var receivedProduct = _.omit(req.body[productType], ['parcels']);
        var ProductType = req.ERMES.ProductType;

        sequelize.transaction((t) => {
           var outterProductProperties = _.pick(receivedProduct, ['uploadDate', 'shared']);
           outterProductProperties.type = productType; // For searching purposes
           outterProductProperties.userId = user.userId; // Faster than doing an UPDATE query later with setUser
           var innerProductProperties = _.omit(receivedProduct, ['uploadDate', 'shared']);

            return Product.create(outterProductProperties, {transaction: t}).then((product) => { // Create general
               innerProductProperties.productId = product.productId; // Link specific with general

               return ProductType.create(innerProductProperties, {transaction: t}).then((innerProduct) => { // Create specific
                  if (user.type === 'owner') {
                      var usersIds = [user.userId];

                      return checkAndAddProduct(parcelIds, usersIds, product, t).then(() => {
                          return [product, innerProduct];
                      });
                  } else {
                      return user.getOwners({transaction: t}).then((owners) => {
                          var usersIds = _.map(owners, (owner) => owner.userId);

                          return checkAndAddProduct(parcelIds, usersIds, product, t).then(() => {
                              return [product, innerProduct];
                          });
                      });
                  }
               });
           });
        }).then((result) => {
            var product = result[0].get({plain: true});
            var innerProduct = result[1].get({plain: true});

            // Combine both general and specific product
            _.extend(product, innerProduct);
            product = _.omit(product, ommitedProductFields);

            // Mixed response
            var response = {};
            response[productType] = product;
            res.status(201).json(response);
        }).catch((ex) => {
            console.error('ERROR CREATING PRODUCT: ' + ex);
            res.status(200).json({errors: {name: [ex.name, ex.message]}});
        });
    });

    function checkAndAddProduct(parcelIds, userIds, product, t) {
        return Parcel.findAll({where: {parcelId: {$in: parcelIds}},
            includes: [{model: User, as: 'owners', where: {userId: {$in: userIds}}}], transaction: t}).then((parcels) => {
            if (parcels.length !== parcelIds.length) {
                throw Error('You do not own all those parcels');
            }

            return product.setParcels(parcels, {transaction: t}); // Add related parcels
        });
    }

    router.use('/:productType/:id', function(req, res, next){


        if(!req.params.id.match("^[0-9]+$")){
            res.status(404).send({errors: {name: ['NOT FOUND']}});
        }
        else{
            // TODO Look for the product and put it on the request
            next();
        }

    });

    router.get('/:productType/:id', function(req, res) {

    });

    router.put('/:productType/:id', function(req, res) {

    });

    router.delete('/:productType/:id', function(req, res) {

    });

    /*router.use('/:product/:id', function(req, res, next){


        if(req.params.id && !req.params.id.match("^[0-9A-Fa-f]{24}$")){
            res.status(404).send('Wrong Data');
        }
        else{
            next();
        }

    });*/


    /*var agrochemical = require("./products-local/agrochemical")();
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
    router.use("/yields", Yield);*/

    return router;

};