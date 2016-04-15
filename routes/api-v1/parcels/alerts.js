var express = require('express');
var router = express.Router();
var path = require('path');

var _ = require('underscore');
_.mixin(require('underscore.inflections'));
var sequelize = require('../../../initializers/db');
var Alert = sequelize.import(path.resolve('./models/local/alert'));

module.exports = function() {

    router.get('/', function(req, res) {
        var parcel = req.parcel;
        var user = req.user;
        var users = req.users;

        new Promise((resolve, reject) => {
            var userIds = _.pluck(users, 'userId');
            if (!_.contains(userIds, user.userId)) {
                reject(new Error('You are not allowed to access this parcel'));
            } else {
                resolve(parcel.get({plain: true}).alerts);
            }
        }).then((alerts) => {
            res.status(200).json({alerts: alerts});
        }).catch((ex) => {
            console.error('PARCEL NOT FOUND: ' + parcel.parcelId);
            res.status(404).json({errors: [{type: ex.name, message: ex.message}]});
        });
    });

    router.post('/', function(req, res) {
        var parcel = req.parcel;
        var user = req.user;
        var users = req.users;

        var newAlerts = [];
        var reqAlerts =req.body.alerts;
        if (reqAlerts) {
            reqAlerts.forEach((alert) => {
                var newAlert = _.pick(alert, ['type', 'value']);
                newAlert.parcelId = parcel.parcelId;
               newAlerts.push(newAlert);
            });
        }

        new Promise((resolve, reject) => {
            if (user.type !== 'admin') {
                reject(new Error('You are not allowed to access this parcel'));
            } else {
                resolve();
            }
        }).then(() => {
            return sequelize.transaction((t) => {
                return Alert.bulkCreate(newAlerts, {transaction: t}).then(() => {
                    return parcel.update({inDanger: true}, {transaction: t}).then(() => {
                        return newAlerts;
                    });
                });
            });
        }).then((alerts) => {
            res.status(201).json({alerts: alerts});
        }).catch((ex) => {
            console.error('PARCEL NOT FOUND: ' + parcel.parcelId);
            res.status(404).json({errors: [{type: ex.name, message: ex.message}]});
        });
    });

    router.delete('/', function (req, res) {
        var parcel = req.parcel;
        var user = req.user;
        var users = req.users;

        sequelize.transaction((t) => {
            var userIds = _.pluck(users, 'userId');
            if (!_.contains(userIds, user.userId)) {
                throw new Error('You are not allowed to access this parcel');
            }

            var response = parcel.get({plain: true}).alerts;
            return Alert.destroy({where: {parcelId: parcel.parcelId}, transaction: t}).then(() => {
                return parcel.update({inDanger: false}, {transaction: t});
            }).then(() => {
                return response;
            });
        }).then((alerts) => {
            res.status(200).json({alerts: alerts});
        }).catch((ex) => {
            console.error('PARCEL NOT FOUND: ' + parcel.parcelId);
            res.status(404).json({errors: [{type: ex.name, message: ex.message}]});
        });
    });

    return router;

};