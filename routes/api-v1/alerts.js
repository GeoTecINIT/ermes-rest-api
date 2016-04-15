var express = require('express');
var router = express.Router();
var path = require('path');
var sequelize = require('../../initializers/db');
var _ = require('underscore');

var Parcel = sequelize.import(path.resolve('./models/local/parcel'));
var User = sequelize.import(path.resolve('./models/local/user'));
var Alert = sequelize.import(path.resolve('./models/local/alert'));

var TemplateLoader = require('../../utils/template-loader');
var Mailer = require('../../utils/mailer');

module.exports = function()
{
    router.get('/send-pending2', function(req, res) {
        var user = req.user;

        if(user.type !== 'admin'){
            res.status(403).json({errors: [{type: 'Forbidden', message: 'You cannot access to this service'}]});
        }
        else {
            var response = {users: []};
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate()-1);

            User.findAll().then((users) => {
                var eachLazyUser = [];
                users.forEach((user) => {
                    var formattedUser = {username: user.username, type: user.type, email: user.email};
                    var parcelLazyLoad;
                    if (user.type === 'owner') {
                        parcelLazyLoad = Parcel.findAll({include: [
                            {
                                model: User,
                                as: 'owners',
                                where: {userId: user.userId}
                            }
                        ], where: {inDanger: true}});
                    } else if (user.type === 'collaborator') {
                        parcelLazyLoad = user.getOwners().then((owners) => {
                            var ownerIds = _.map(owners, (owner) => owner.userId);
                            return Parcel.findAll({include: [
                                {
                                    model: User,
                                    as: 'owners',
                                    where: {userId: {$in: ownerIds}}
                                }
                            ], where: {inDanger: true}});
                        });
                    }
                    if (parcelLazyLoad) {
                        eachLazyUser.push(parcelLazyLoad.then((parcels) => {
                            formattedUser.parcels = [];
                            var eachLazyParcel = [];
                            parcels.forEach((parcel) => {
                                var formattedParcel = {parcelId: parcel.parcelId, inDanger: parcel.inDanger};
                                eachLazyParcel.push(parcel.getAlerts({where: {createdAt: {$gt: yesterday}}}).then((alerts) => {
                                    formattedParcel.alerts = alerts;
                                    if (alerts.length > 0) {
                                        formattedUser.parcels.push(formattedParcel);
                                    }
                                }));
                            });
                            return Promise.all(eachLazyParcel).then(() => {
                                if (formattedUser.parcels.length > 0) {
                                    response.users.push(formattedUser);
                                }
                            });
                        }));
                    }
                });
                return Promise.all(eachLazyUser);
            }).then(() => {
                res.status(200).json(response);
            }).catch((ex) => {
                console.error('ERROR FINDING USER: ' + ex);
                res.status(404).json(({errors: [{type: ex.name, message: ex.message}]}));
            });
        }
    });

    router.get('/send-pending', function(req, res) {
        var user = req.user;

        if(user.type !== 'admin'){
            res.status(403).json({errors: [{type: 'Forbidden', message: 'You cannot access to this service'}]});
        }
        else {
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate()-0.8);

            User.findAll({attributes: ['email'], include: [
                {
                    model: User,
                    as: 'collaborators',
                    attributes: ['email']
                },
                {
                    model: Parcel,
                    as: 'parcels',
                    where: {inDanger: true},
                    attributes: ['parcelId'],
                    include: [
                        {
                            model: Alert,
                            as: 'alerts',
                            where: {createdAt: { $gt: yesterday}}
                        }
                    ]
                }
            ], where: {type: 'owner'}}).then((users) => {
                return users;
            }).then((response) => {
                res.status(200).json(response);
                sendMail(response);
            }).catch((ex) => {
                console.error('ERROR FINDING USER: ' + ex);
                res.status(404).json(({errors: [{type: ex.name, message: ex.message}]}));
            });
        }
    });

    return router;
};


function sendMail(owners){
    owners.forEach((owner) => {
        var emails = [owner.email];
        owner.collaborators.forEach((collaborator) => {
           emails.push(collaborator.email);
        });

        var parcelIds = _.pluck(owner.parcels, 'parcelId');

        var subject = "Parcel/s are in danger [parcelId: " + parcelIds + "]";
        TemplateLoader.compileMailTemplate('parcel-alert', {parcels: owner.parcels, parcelIds}).then((html) => {
            Mailer.sendMail(emails, subject, html);
        }).catch((err) => {
            console.error(err);
        });
    });
}