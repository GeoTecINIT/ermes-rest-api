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
    router.post('/send-pending', function(req, res) {
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