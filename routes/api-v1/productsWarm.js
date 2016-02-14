var express = require('express');
var router = express.Router();
var path = require('path');

var defaults = require('../../helpers/config');
var _ = require('underscore');
_.mixin(require('underscore.inflections'));
var sequelize = require('../../initializers/db');

var Parcel = sequelize.import(path.resolve('./models/local/parcel'));
var User = sequelize.import(path.resolve('./models/local/user'));

module.exports = function() {

    router.get('/', function(req, res) {
        var user = req.user;
        var parcelId = req.query.parcelId;

        var doy = req.query.doy;
        var year = req.query.year;

        new Promise((resolve, reject) => {
            var columnNames = _.map(defaults.allWARMProducts, (product) => product.column);
            var attributes = columnNames.concat(['parcelId', 'doy', 'year']);

            if (user.type === 'owner') {
                user.getParcels().then((parcels) => {
                   var parcelIds = _.map(parcels, (parcel) => parcel.parcelId);
                   if (!_.contains(parcelIds, parcelId)) {
                        reject(new Error('You do not own that parcel'));
                   } else {
                        findWARMProducts(user.region, parcelId, attributes, year, doy).then((warmProducts) => {
                            resolve(warmProducts);
                        });
                   }
                });
            } else { // Collaborator
                user.getOwners().then((owners) => {
                    var ownerIds = _.map(owners, (owner) => owner.userId);

                    Parcel.findAll({where: {parcelId: parcelId}, // TODO check if this works
                        includes: [{model: User, as: 'owners', where: {userId: {$in: ownerIds}}}]}).then((parcels) => {
                        if (parcels.length === 0) {
                            reject(new Error('You do not have access to that parcel'));
                        } else {
                            findWARMProducts(user.region, parcelId, attributes, year, doy).then((warmProducts) => {
                                resolve(warmProducts);
                            });
                        }
                    });
                });
            }
        }).then((products) => {
            var response = {};

            defaults.allWARMProducts.forEach((product) => {
                response[product.name] = [];
            });

            defaults.allWARMProducts.forEach((productClass) => {
               products.forEach((product) => {
                   var plainProduct =product.get({plain: true});
                   var formatted = _.pick(plainProduct, ['doy', 'year']);
                   formatted.value = plainProduct[productClass.column];
                   response[productClass.name].push(formatted);
               });
            });

            res.status(200).json(response);
        }).catch((ex) => {
            console.error('ERROR FETCHING WARM PRODUCTS: ' + ex);
            res.status(200).json({errors: {name: [ex.name, ex.message]}});
        });

    });

    // Check if we are offering the product that the client is looking for
    router.use('/:productType', function(req, res, next) {
        var warmNames = _.map(defaults.allWARMProducts, (product) => product.name);
        if (_.contains(warmNames, req.params.productType)) {
            next();
        } else {
            res.type('text/plain');
            res.status(404).send("404 - These aren't the products you're looking for");
            console.log('Requested resource:', req.url, '- Not Available');
        }
    });

    router.get('/:productType/', function(req, res) {
        var user = req.user;
        var parcelId = req.query.parcelId;

        var doy = req.query.doy;
        var year = req.query.year;

        var productType = req.params.productType;

        new Promise((resolve, reject) => {
            var warmClass = _.find(defaults.allWARMProducts, (product) => product.name === productType);
            var attributes = ['parcelId', 'doy', 'year', warmClass.column];

            if (user.type === 'owner') {
                user.getParcels().then((parcels) => {
                    var parcelIds = _.map(parcels, (parcel) => parcel.parcelId);
                    if (!_.contains(parcelIds, parcelId)) {
                        reject(new Error('You do not own that parcel'));
                    } else {
                        findWARMProducts(user.region, parcelId, attributes, year, doy).then((predictions) => {
                            var product = [];
                            predictions.forEach((prediction) => {
                                var plainPrediction = prediction.get({plain: true});
                                var formatted = _.pick(plainPrediction, ['doy', 'year']);
                                formatted.value = plainPrediction[warmClass.column];
                                product.push(formatted);
                            });
                            resolve(product);
                        });
                    }
                });
            } else { // Collaborator
                user.getOwners().then((owners) => {
                    var ownerIds = _.map(owners, (owner) => owner.userId);

                    Parcel.findAll({where: {parcelId: parcelId},
                        includes: [{model: User, as: 'owners', where: {userId: {$in: ownerIds}}}]}).then((parcels) => {
                        if (parcels.length === 0) {
                            reject(new Error('You do not have access to that parcel'));
                        } else {
                            findWARMProducts(user.region, parcelId, attributes, year, doy).then((predictions) => {
                                var product = [];
                                predictions.forEach((prediction) => {
                                    var plainPrediction = prediction.get({plain: true});
                                    var formatted = _.pick(plainPrediction, ['doy', 'year']);
                                    formatted.value = plainPrediction[warmClass.column];
                                    product.push(formatted);
                                });
                                resolve(product);
                            });
                        }
                    });
                });
            }
        }).then((product) => {
            res.status(200).json({productType: product});
        }).catch((ex) => {
            console.error('ERROR FETCHING WARM PRODUCT: ' + ex);
            res.status(200).json({errors: {name: [ex.name, ex.message]}});
        });

    });

    function findWARMProducts(region, parcelId, attributes, year, doy) {
        var WARM = sequelize.import(path.resolve('./models/warm/outWARM_' + region));

        return WARM.findAll({attributes: attributes,
            where: {year: year, parcelId: parcelId, doy: {$between: [doy, doy+4]}}}).then((products) => {

            if (products.length !== 0 && products.length < 5) { // If end of year is close
                var remaining = 5 - products.length;

                return WARM.findAll({attributes: attributes,
                    where: {year: year+1, parcelId: parcelId, doy: {$between: [1, remaining-1]}}}).then((productsNewYear) => {
                    return products.concat(productsNewYear);
                });
            } else {
                return products;
            }
        });
    }

    return router;

};