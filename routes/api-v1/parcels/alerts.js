var express = require('express');
var router = express.Router();
var path = require('path');


var loggers = require('../../../initializers/loggers');
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

        var newAlert = _.pick(req.body.alert, ['type', 'value']);
        newAlert.parcelId = parcel.parcelId;

        new Promise((resolve, reject) => {
            if (user.type !== 'admin') {
                reject(new Error('You are not allowed to access this parcel'));
            } else {
                resolve();
            }
        }).then(() => {
            return sequelize.transaction((t) => {
                return Alert.create(newAlert, {transaction: t}).then((alert) => {
                    return parcel.update({inDanger: true}, {transaction: t}).then(() => {
                        return alert;
                    });
                });
            });
        }).then((alert) => {
            var userMails = _.map(users, (user) => user.email);
            sendMail(userMails, parcel, alert);
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

// Send a confirmation email
function sendMail(emails, parcel, alert){
    console.log(emails);

    var to = emails;
    var subject = "Parcel is in danger [parcelId: " + parcel.parcelId + "]";
    var message = "A new alert has appeared on parcel " + parcel.parcelId + ".";

    var type = "The danger that triggered the alert was: " + alert.type;
    var value = "The actual value for this alert is: " + alert.value;

    var redirect = "Please connect to the Geoportal for more info. ";
    var geoportal = "http://ermes.dlsi.uji.es/prototype/geoportal";

    var htmlText = "<p>" + message + "</p>";
    var alertData = "<p><ul><li>" + type + "</li><li>" + value + "</li></ul></p>";
    var conclusion = "<p>" + redirect + "<a href='" + geoportal + "'>"+ geoportal + "</a></p>";

    var htmlContent =  "<br>" + htmlText + "<br>" + alertData + "<br>" + conclusion;

    var nodemailer = require("nodemailer");

    var transporter = nodemailer.createTransport('smtps://ermesmailer@gmail.com:fp7ermes@smtp.gmail.com');

    var mailOptions = {
        from: 'ERMES <ermesmailer@gmail.com>', // sender address
        to: to,
        subject: subject,
        html: htmlContent,
        text: message + " " + redirect + " " + geoportal
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.error('[EMAIL]: '+ JSON.stringify(error));
            loggers.error.write('[' + new Date() + ' EMAIL]: '+ JSON.stringify(error) + '\n');
        } else {
            console.log('[EMAIL]: '+ JSON.stringify(info));
            loggers.info.write('[' + new Date() + ' EMAIL]: '+ JSON.stringify(info) + '\n');
        }
    });

}