var express = require('express');
var router = express.Router();
var path = require('path');
var sequelize = require('../../initializers/db');
var Parcel = sequelize.import(path.resolve('./models/parcel'));
var _ = require('underscore');
var config = require('../../helpers/config');

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
            res.status(201).json({err: false, parcel: _.omit(parcel.get({plain: true}), ['updatedAt', 'createdAt']) });
        }).catch((ex) => {
            console.error('ERROR CREATING PARCEL: ' + ex);
            res.status(200).json({err: true, content: {name: ex.name, msg: ex.message}});
        });
    });

    router.get('/:parcelId', function(req, res){
        var parcelId = req.params.parcelId;
        var limit = req.query.limit;
        var user = req.ERMES.user;

        var parcel = _.find(user.parcels, (parcel) => parcel.parcelId === parcelId);

        if(_.isUndefined(limit)) {
            limit = 1;
        }

        if(limit <= 0 || limit > 9999) {
            res.jsonp({error: "Limit not valid, must be from 0 to 9999"});
            return;
        }

        // All the products
        var response = _.pick(parcel, config.allLocalProducts);

        _.mapObject(response, (value, key) => {
            if(!_.isArray(value)) {
                return;
            }

            // Sort by uploadingdate
            response[key] =_.chain(response[key])
                                .sortBy((product) => Date.parse(product.uploadingDate) * -1) // Sorcery, by date descending.
                                .first(limit)
                                .value();
        });

        parcel = {
            parcelId: parcelId
        };
        _.mapObject(response, (value, key) => {
           if(!_.isArray(value)) {
               return;
           }
            parcel[key] = _.map(response[key], (product) => product._id);
        });
        response.parcel = parcel;


        res.jsonp(response);
    });

    return router;
};