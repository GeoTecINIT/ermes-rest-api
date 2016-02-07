var express = require('express');
var router = express.Router();
var path = require('path');
var sequelize = require('../../initializers/db');
var Parcel = sequelize.import(path.resolve('./models/parcel'));
var User = sequelize.import(path.resolve('./models/user'));
var _ = require('underscore');
_.mixin(require('underscore.inflections'));
var config = require('../../helpers/config');

const fieldsToOmit = ['updatedAt', 'createdAt', 'user_parcels', 'Owners'];

module.exports = function()
{

    router.post('/', function(req, res) {
        if (req.body.parcel && req.body.parcel.parcelId) {
            req.body.parcel.parcelId = req.body.parcel.parcelId.toLowerCase();
        }
        sequelize.transaction((t) => {
            return Parcel.findOrCreate({where: {parcelId: req.body.parcel.parcelId}, defaults: req.body.parcel, transaction: t})
              .spread((parcel) => {
                var user = req.ERMES.user;
                if (req.ERMES.user.type !== 'owner') {
                    throw new Error("You have to be an owner to manage parcels");
                } else {
                    return parcel.getOwners({transaction: t}).then((owners) => {
                        if (_.find(owners, (owner) => owner.userId === user.userId)){
                            throw new Error('You already own that parcel');
                        }
                        owners.push(user);
                        return parcel.setOwners(owners, {transaction: t}).then(() => {
                            return getClassifiedParcelProductIDs(parcel, t).then((classifiedProducts) => {
                                parcel = _.omit(parcel.get({plain: true}), fieldsToOmit);
                                _.extend(parcel, classifiedProducts);
                                return parcel;
                            });
                        });
                    });
                }
            });
        }).then((parcel) => {
            res.status(201).json({parcel: parcel});
        }).catch((ex) => {
            console.error('ERROR CREATING PARCEL: ' + ex);
            res.status(200).json({errors: {name: [ex.name, ex.message]}});
        });
    });

    /**
     * Path params: parcelId (Id of the parcel that we want to obtain)
     * Query params: limit (number of records)
     *        -> Options:
     *            - undefined = 1 record
     *            - a number = n records
     *            - "unlimited" = findAll
     */
    router.get('/:parcelId', function(req, res){
        var parcelId = req.params.parcelId.toLowerCase();
        var limit = req.query.limit || 1;
        var user = req.ERMES.user;

            sequelize.transaction((t) => {
                if (user.type === 'owner') {
                    return user.getParcels({include: [{all : true}], transaction: t}).then((parcels) => {
                        var parcel = _.find(parcels, (parcel) => parcel.parcelId === parcelId);
                        if (!parcel) {
                            throw new Error("Parcel not found or you do not own it");
                        }
                        return Parcel.findOne({where: {parcelId: parcelId}, transaction: t}).then((parcel) => {
                            return getClassifiedParcelProductIDs(parcel, t).then((classifiedProducts) => {
                                parcel = _.omit(parcel.get({plain: true}), fieldsToOmit);
                                _.extend(parcel, classifiedProducts);
                                return parcel;
                            });
                        });
                    });
                } else {
                    return user.getOwners({transaction: t}).then((owners) => {
                        var ownerIds = _.map(owners, (owner) => owner.userId);
                        return Parcel.findAll({
                            include: [{
                                model: User,
                                as: 'Owners',
                                where: {userId: {$in: ownerIds}}
                            }], transaction: t
                        }).then((parcels) => {
                            var parcel = _.find(parcels, (parcel) => parcel.parcelId === parcelId);
                            if (!parcel) {
                                throw new Error("Parcel not found");
                            }
                            return getClassifiedParcelProductIDs(parcel, t).then((classifiedProducts) => {
                                parcel = _.omit(parcel.get({plain: true}), fieldsToOmit);
                                _.extend(parcel, classifiedProducts);
                                return parcel;
                            });
                        });
                    });
                }
            }).then((parcel) => {
                res.status(200).json({parcel: parcel });
            }).catch((ex) => {
                console.error('PARCEL NOT FOUND: ' + parcelId);
                res.status(404).json({errors: {name: [ex.name, ex.message]}});
            });

        // TODO Add parcel products
    });

    router.delete('/:parcelId', function(req, res) {
        var parcelId = req.params.parcelId.toLowerCase();
        var user = req.ERMES.user;

        sequelize.transaction((t) => {
            return user.getParcels({transaction: t}).then((parcels) => {
                var parcel = _.find(parcels, (parcel) => parcel.parcelId === parcelId);
                if (!parcel) {
                    throw new Error("Parcel not found or you do not own it");
                }
                return parcel.removeOwner(user, {transaction: t}).then(() => {
                    return Parcel.findOne({where: {parcelId: parcelId}, transaction: t}).then((parcel) => {
                        return getClassifiedParcelProductIDs(parcel, t).then((classifiedProducts) => {
                            parcel = _.omit(parcel.get({plain: true}), fieldsToOmit);
                            _.extend(parcel, classifiedProducts);
                            return parcel;
                        });
                    });
                });
            }).then((parcel) => {
                res.status(200).json({parcel: parcel});
            }).catch((ex) => {
                console.error('PARCEL NOT FOUND: ' + parcelId);
                res.status(404).json({errors: {name: [ex.name, ex.message]}});
            });
        });
    });

    return router;
};

function getClassifiedParcelProductIDs(parcel, t) {
    return parcel.getProducts({transaction: t}).then((products) => {
        var classifiedProducts = {};
        config.allLocalProducts.forEach((productType) => {
            classifiedProducts[_.pluralize(productType)] = _.map(_.where(products, {type: productType}), (product) => product.productId);
        });
        return classifiedProducts;
    });
}