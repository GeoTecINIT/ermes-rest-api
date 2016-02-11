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

    // Check if we are offering the product that the client is looking for
    router.use('/:productType', function(req, res, next) {
        if (_.contains(defaults.allLocalProducts, req.params.productType)) {
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
        var ProductType = sequelize.import(path.resolve('./models/' + _.singularize(req.params.productType)));

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

                      return checkAndAddProductToParcel(parcelIds, usersIds, product, t).then(() => {
                          return [product, innerProduct];
                      });
                  } else {
                      return user.getOwners({transaction: t}).then((owners) => {
                          var usersIds = _.map(owners, (owner) => owner.userId);

                          return checkAndAddProductToParcel(parcelIds, usersIds, product, t).then(() => {
                              return [product, innerProduct];
                          });
                      });
                  }
               });
           });
        }).then((result) => {
            buildProduct(res, result, productType);
        }).catch((ex) => {
            console.error('ERROR CREATING PRODUCT: ' + ex);
            res.status(200).json({errors: {name: [ex.name, ex.message]}});
        });
    });

    function checkAndAddProductToParcel(parcelIds, userIds, product, t) {
        return Parcel.findAll({where: {parcelId: {$in: parcelIds}},
            includes: [{model: User, as: 'owners', where: {userId: {$in: userIds}}}], transaction: t}).then((parcels) => {
            if (parcels.length !== parcelIds.length) {
                throw Error('You do not own all those parcels');
            }

            return product.setParcels(parcels, {transaction: t}); // Add related parcels
        });
    }

    router.use('/:productType/:productId', function(req, res, next){
        var productId = req.params.productId;

        if(!productId.match("^[0-9]+$")){
            res.status(404).send({errors: {name: ['NOT FOUND']}});
        }
        else{
            Product.findOne({where: {productId: productId}}).then((product) => {
                if (!product) {
                    throw new Error('Not found');
                }
                req.ERMES.product = product;
                next();
            }).catch((ex) => {
                console.error('PRODUCT NOT FOUND: ' + productId);
                res.status(404).json({errors: {name: [ex.name, ex.message]}});
            });
        }

    });

    router.get('/:productType/:id', function(req, res) {
        var user = req.ERMES.user;
        var product = req.ERMES.product;

        new Promise((resolve, reject) => {
            if (user.type === 'owner') {
                user.getCollaborators().then((collaborators) => {
                    var userIds = _.map(collaborators, (collaborator) => collaborator.userId);
                    userIds.push(user.userId);
                    if (!_.contains(userIds, product.userId)) {
                        reject(new Error('You do not have access to this product'));
                    } else {
                        product.getInnerProduct().then((innerProduct) => {
                            resolve([product, innerProduct]);
                        });
                    }
                });
            } else {
                user.getOwners().then((owners) => {
                    var userIds = _.map(owners, (owner) => owner.userId);
                    userIds.push(user.userId);
                    if (!_.contains(userIds, product.userId)) {
                        reject(new Error('You do not have access to this product'));
                    } else {
                        product.getInnerProduct().then((innerProduct) => {
                            resolve([product, innerProduct]);
                        });
                    }
                });
            }
        }).then((result) => {
            buildProduct(res, result, product.type);
        }).catch((ex) => {
            console.error('FORBIDDEN: ' + product.type + ' ' + product.productId);
            res.status(401).json({errors: {name: [ex.name, ex.message]}});
        });

    });

    router.put('/:productType/:id', function(req, res) {
        var user = req.ERMES.user;
        var product = req.ERMES.product;


        var updateGeneral = _.pick(req.body[product.type], ['shared']);
        var updateSpecific = _.omit(req.body[product.type], ['productId', 'createdAt', 'updatedAt']);

        sequelize.transaction((t) => {
            if (user.userId !== product.userId) {
                throw new Error('You do not have permission to manage this product');
            } else {
                return product.getInnerProduct({transaction: t}).then((innerProduct) => {
                    return product.update(updateGeneral, {transaction: t}).then(() => {
                        return innerProduct.update(updateSpecific, {transaction: t}).then(() => {
                            return [product, innerProduct];
                        });
                    });

                });
            }
        }).then((result) => {
            buildProduct(res, result, product.type);
        }).catch((ex) => {
            console.error('FORBIDDEN: ' + product.type + ' ' + product.productId);
            res.status(403).json({errors: {name: [ex.name, ex.message]}});
        });
    });

    router.delete('/:productType/:id', function(req, res) {
        var user = req.ERMES.user;
        var product = req.ERMES.product;

        sequelize.transaction((t) => {
           if (user.userId !== product.userId) {
               throw new Error('You do not have permission to manage this product');
           } else {
               return product.getInnerProduct({transaction: t}).then((innerProduct) => {
                   var productPlain = product.get({plain: true});
                   var innerProductPlain = innerProduct.get({plain: true});

                   // Combine both general and specific product
                   _.extend(productPlain, innerProductPlain);
                   productPlain = _.omit(productPlain, ommitedProductFields);

                   // Mixed response
                   var response = {};
                   response[product.type] = productPlain;

                   // Remove from the system

                   return innerProduct.destroy({transaction: t}).then(() => {
                       return product.destroy({transaction: t}).then(() => {
                           return [product, innerProduct];
                       });
                   });
               });
           }
        }).then((result) => {
            buildProduct(res, result, product.type);
        }).catch((ex) => {
            console.error('FORBIDDEN: ' + product.type + ' ' + product.productId);
            res.status(403).json({errors: {name: [ex.name, ex.message]}});
        });
    });

    function buildProduct(res, result, productType) {
        var product = result[0].get({plain: true});
        var innerProduct = result[1].get({plain: true});

        // Combine both general and specific product
        _.extend(product, innerProduct);
        product = _.omit(product, ommitedProductFields);

        // Mixed response
        var response = {};
        response[productType] = product;
        res.status(201).json(response);
    }

    return router;

};