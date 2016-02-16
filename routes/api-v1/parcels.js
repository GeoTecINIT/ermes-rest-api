var express = require('express');
var router = express.Router();
var path = require('path');
var sequelize = require('../../initializers/db');
var _ = require('underscore');
var config = require('../../helpers/config');

var Parcel = sequelize.import(path.resolve('./models/local/parcel'));
var User = sequelize.import(path.resolve('./models/local/user'));
var Product = sequelize.import(path.resolve('./models/local/product'));

const fieldsToOmit = ['updatedAt', 'createdAt', 'user_parcels', 'owners'];

module.exports = function()
{

    router.post('/', function(req, res) {
        if (req.body.parcel && req.body.parcel.parcelId) {
            req.body.parcel.parcelId = req.body.parcel.parcelId.toLowerCase();
        }
        sequelize.transaction((t) => {
            return Parcel.findOrCreate({where: {parcelId: req.body.parcel.parcelId}, defaults: req.body.parcel, transaction: t})
              .spread((parcel) => {
                var user = req.user;
                if (req.user.type !== 'owner') {
                    throw new Error("You have to be an owner to manage parcels");
                } else {
                    return parcel.hasOwner(user, {transaction: t}).then((has) => {
                        if (has) {
                            throw new Error('You already own that parcel');
                        }
                        return parcel.addOwner(user, {transaction: t}).then(() => {
                            return getFullParcelResponse(user, parcel, {transaction: t});
                        });
                    });
                }
            });
        }).then((response) => {
            res.status(201).json(response);
        }).catch((ex) => {
            console.error('ERROR CREATING PARCEL: ' + ex);
            res.status(200).json({errors: [{type: ex.name, message: ex.message}]});
        });
    });

    /**
     * Path params: parcelId (Id of the parcel that we want to obtain)
     * Query params: limit (number of records)
     *        -> Options:
     *            - undefined = 1 record
     *            - a number = n records
     *            - -1 = findAll
     */
    router.get('/:parcelId', function(req, res){
        var parcelId = req.params.parcelId.toLowerCase();
        var limit = req.query.limit || 1;
        var user = req.user;

            new Promise((resolve, reject) => {
                if (user.type === 'owner') {
                    user.getParcels().then((parcels) => {
                        var parcel = _.find(parcels, (parcel) => parcel.parcelId === parcelId);
                        if (!parcel) {
                            reject(new Error("Parcel not found or you do not own it"));
                        } else {
                            resolve(getFullParcelResponse(user, parcel, {limit: limit}));
                        }
                    });
                } else {
                    user.getOwners().then((owners) => {
                        var ownerIds = _.map(owners, (owner) => owner.userId);
                        Parcel.findOne({
                            where: {parcelId: parcelId},
                            include: [{
                                model: User,
                                as: 'owners',
                                where: {userId: {$in: ownerIds}}
                            }]
                        }).then((parcel) => {
                            if (!parcel) {
                                reject(Error("Parcel not found"));
                            } else {
                                parcel.getOwners().then((owners) => {
                                    var owner = _.find(owners, (owner) => _.contains(ownerIds, owner.userId));
                                    resolve(getFullParcelResponse(owner, parcel, {limit: limit}));
                                });
                            }
                        });
                    });
                }
            }).then((response) => {
                res.status(200).json(response);
            }).catch((ex) => {
                console.error('PARCEL NOT FOUND: ' + parcelId);
                res.status(404).json({errors: [{type: ex.name, message: ex.message}]});
            });

    });

    router.delete('/:parcelId', function(req, res) {
        var parcelId = req.params.parcelId.toLowerCase();
        var user = req.user;

        sequelize.transaction((t) => {
            return user.getParcels({transaction: t}).then((parcels) => {
                var parcel = _.find(parcels, (parcel) => parcel.parcelId === parcelId);
                if (!parcel) {
                    throw new Error("Parcel not found or you do not own it");
                }
                return parcel.removeOwner(user, {transaction: t}).then(() => {
                    return getFullParcelResponse(user, parcel, {transaction: t});
                });
            }).then((response) => {
                res.status(200).json(response);
            }).catch((ex) => {
                console.error('PARCEL NOT FOUND: ' + parcelId);
                res.status(404).json({errors: [{type: ex.name, message: ex.message}]});
            });
        });
    });

    return router;
};

function getFullParcelResponse(user, parcel, options) {
    // If there's no transaction, it is undefined so does nothing

    var t = options.transaction;
    var limit = options.limit;

    return user.getCollaborators({transaction: t}).then((collaborators) => {
        var users = _.map(collaborators, (collaborator) => collaborator.userId);
        users.push(user.userId);
        return getAuthorizedParcelProducts(parcel.parcelId, users, t).then((authorizedProducts) => {
            var classifiedProducts = authorizedProducts[0];
            var entireProducts = authorizedProducts[1];

            if (limit && limit !== '-1') { // This can comes in string format, don't replace with !==
                _.keys(classifiedProducts).forEach((productType) => {
                    classifiedProducts[productType] = classifiedProducts[productType].slice(0, limit);
                    entireProducts[productType] = entireProducts[productType].slice(0, limit);
                });
            }

            var response = {};

            // Add parcel info
            response.parcel = _.omit(parcel.get({plain: true}), fieldsToOmit);

            // Add links to products
            _.extend(response.parcel, classifiedProducts);

            // Add parcel products (performance improvement)
            _.extend(response, entireProducts);
            return response;
        });
    });
}

function getAuthorizedParcelProducts(parcelId, users, transaction) {
    // First create the options object that we are going to pass to the products find query
    var options = {includes: [
        {model: User, as: 'user', where: {userId: {$in: users}}},
        {model: Parcel, as: 'parcels', where: {parcelId: parcelId}}
    ], order: [['uploadDate', 'DESC']]};

    if (transaction) {options.transaction = transaction;} // Add transaction to the options if needed

    // Find all the products for a determinate parcel and for a group of users that are collaborating
    return Product.findAll(options).then((products) => {
        var classifiedProducts = {}; // Product IDs, for creating links for each type of product inside the parcel JSON key
        var entireProducts = {}; // Full products content per type

        // Each product has an inner product related (agrochemical, irrigation, ...) loading this product is lazy so we have to wait for each product type (Concurrently)
        var lazyProducts = [];

        config.allLocalProducts.forEach((productType) => { // For each product type that we offer

            // Filter all the products per product type
            entireProducts[productType] = _.map(_.filter(products, (product) => product.type === _.singularize(productType)), (product) => {
                return product.getInnerProduct({transaction: transaction}).then((innerProduct) => { // THE BAD ONE, if you're asking why this code is so strange, this is the cause
                    var plainProduct = product.get({plain: true});
                    innerProduct = innerProduct.get({plain: true});
                    _.extend(plainProduct, innerProduct);
                    plainProduct = _.omit(plainProduct, ['createdAt', 'updatedAt', 'type', 'userId']);
                    return plainProduct; // Once the innerProduct has been retrieved, return the final object formatted
                });
            });

            // Wait for each innerProduct in this product type to be fulfilled
            lazyProducts.push(Promise.all(entireProducts[productType]).then(() => {
                entireProducts[productType] = _.map(entireProducts[productType], (promise) => { // Here we are expecting the fulfillment promise
                    return promise.toJSON().fulfillmentValue; // This is safe, since all().then() is telling us that all promises have finished with a good result
                });
                classifiedProducts[productType] = _.map(entireProducts[productType], (product) => product.productId); // Get the link, map is synchronous
            }));
        });
        return Promise.all(lazyProducts).then(() => { // Wait for all productTypes to finish their own all() promise
            return [classifiedProducts, entireProducts]; // Links, full-products
        });
    });
}