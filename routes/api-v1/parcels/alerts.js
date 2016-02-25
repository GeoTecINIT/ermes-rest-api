var express = require('express');
var router = express.Router();
var path = require('path');

var _ = require('underscore');
_.mixin(require('underscore.inflections'));
var sequelize = require('../../../initializers/db');
var Parcel = sequelize.import(path.resolve('./models/local/parcel'));
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
        var newAlert = _.pick(req.body.alert, ['type', 'value']);
        newAlert.parcelId = parcel.parcelId;

        new Promise((resolve, reject) => {
            if (user.type !== 'admin') {
                reject(new Error('You are not allowed to access this parcel'));
            } else {
                Alert.create(newAlert).then((alert) => {
                   resolve(alert);
                }).catch((err) => {
                    reject(err);
                });
            }
        }).then((alert) => {
            res.status(201).json({alert: alert});
        }).catch((ex) => {
            console.error('PARCEL NOT FOUND: ' + parcel.parcelId);
            res.status(404).json({errors: [{type: ex.name, message: ex.message}]});
        });
    });

    router.delete('/', function (req, res) {
        var parcel = req.parcel;
        var user = req.user;
        var users = req.users;

        new Promise((resolve, reject) => {
            var userIds = _.pluck(users, 'userId');
            if (!_.contains(userIds, user.userId)) {
                reject(new Error('You are not allowed to access this parcel'));
            } else {
                var response = parcel.get({plain: true}).alerts;
                Alert.destroy({where: {parcelId: parcel.parcelId}}).then(() => {
                    resolve(response);
                }).catch((err) => {
                    reject(err);
                });
            }
        }).then((alerts) => {
            res.status(200).json({alerts: alerts});
        }).catch((ex) => {
            console.error('PARCEL NOT FOUND: ' + parcel.parcelId);
            res.status(404).json({errors: [{type: ex.name, message: ex.message}]});
        });
    });

    return router;

};