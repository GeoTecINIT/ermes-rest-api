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
                return reject(new Error('You are not allowed to access this parcel'));
            }
            return resolve();
        }).then(() => {
            return getUserAlerts(user);
        }).then((userIds) => {
            return Alert.findAll({where: {parcelId: parcel.parcelId, $and: {userId: {$in: userIds}}}});
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
                var newAlert = _.pick(alert, ['type', 'value', 'userId']);
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
                    // return parcel.update({inDanger: true}, {transaction: t}).then(() => {
                    return newAlerts;
                    // });
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
            return getUserAlerts(user, t).then((userIds) => {
                return Alert.findAll(
                    {where: {parcelId: parcel.parcelId, $and: {userId: {$in: userIds}}}}, 
                    {transaction: t}
                ).then((alerts) => {
                    return Alert.destroy({
                        where: {parcelId: parcel.parcelId, $and: {userId: {$in: userIds}}},
                        transaction: t
                    }).then(() => {
                        return alerts;
                    });
                });
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

function getUserAlerts(user, transaction) {
    return new Promise((resolve, reject) => {
        if (user.type === 'collaborator') {
            user.getOwners({transaction}).then((owners) => {
                resolve(owners.map((owner) => owner.userId));
            });
        } else {
            resolve([user.userId]);
        }
    });
}