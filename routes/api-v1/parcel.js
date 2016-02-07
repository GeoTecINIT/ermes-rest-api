var express = require('express');
var router = express.Router();
var path = require('path');
var sequelize = require('../../initializers/db');
var Parcel = sequelize.import(path.resolve('./models/parcel'));
var User = sequelize.import(path.resolve('./models/user'));
var _ = require('underscore');
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
                        owners.push(user);
                        return parcel.setOwners(owners, {transaction: t}).then(() => {
                            return parcel;
                        });
                    });
                }
            });
        }).then((parcel) => {
            res.status(201).json({err: false, parcel: _.omit(parcel.get({plain: true}), fieldsToOmit) });
        }).catch((ex) => {
            console.error('ERROR CREATING PARCEL: ' + ex);
            res.status(200).json({err: true, content: {name: ex.name, msg: ex.message}});
        });
    });

    router.get('/:parcelId', function(req, res){
        var parcelId = req.params.parcelId.toLowerCase();
        var limit = req.query.limit || 1;
        var user = req.ERMES.user;

            sequelize.transaction((t) => {
                if (user.type === 'owner') {
                    return user.getParcels({transaction: t}).then((parcels) => {
                        var parcel = _.find(parcels, (parcel) => parcel.parcelId === parcelId);
                        if (!parcel) {
                            throw new Error("Parcel not found or you do not own it");
                        }
                        return parcel.get({plain: true});
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
                            return parcel.get({plain: true});
                        });
                    });
                }
            }).then((parcel) => {
                res.status(200).json({err: false, parcel: _.omit(parcel, fieldsToOmit) });
            }).catch((ex) => {
                console.error('PARCEL NOT FOUND: ' + parcelId);
                res.status(404).json({err: true, content: {name: ex.name, msg: ex.message}});
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
                    return parcel;
                });
            }).then((parcel) => {
                res.status(200).json({err: false, parcel: _.omit(parcel.get({plain: true}), fieldsToOmit) });
            }).catch((ex) => {
                console.error('PARCEL NOT FOUND: ' + parcelId);
                res.status(404).json({err: true, content: {name: ex.name, msg: ex.message}});
            });
        });
    });

    return router;
};