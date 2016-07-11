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

            User.findAll({attributes: ['email', 'language'], include: [
                {
                    model: User,
                    as: 'collaborators',
                    attributes: ['email']
                },
                {
                    model: Alert,
                    as: 'alerts',
                    where: {createdAt: {$gt: yesterday}},
                    include: [
                        {
                            model: Parcel,
                            as: 'parcel',
                            attributes: ['parcelId']
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
        var lang = owner.language;

        var parcelAlerts = {
            FIRST_FERTILIZATION: new Set(),
            SECOND_FERTILIZATION: new Set(),
            INFECTION: new Set()
        };
        
        owner.alerts.forEach((alert) => {
            if (alert.type === 'Stagecode Alert') {
                if (alert.value >= 1.2 && alert.value <= 1.5) {
                    parcelAlerts.FIRST_FERTILIZATION.add(alert.parcelId);
                } else if (alert.value >= 2.3 && alert.value <= 2.5) {
                    parcelAlerts.SECOND_FERTILIZATION.add(alert.parcelId);
                }
            } else if (alert.type === 'Infection Risk Alert') {
                parcelAlerts.INFECTION.add(alert.parcelId);
            }
        });
        
        var emails = [owner.email];
        owner.collaborators.forEach((collaborator) => {
           emails.push(collaborator.email);
        });

        if (parcelAlerts.FIRST_FERTILIZATION.size > 0) {
            TemplateLoader.compileMailTemplate(lang +'/first-fertilization', {parcels: parcelAlerts.FIRST_FERTILIZATION}).then((html) => {
                var subject = subjects.FIRST_FERTILIZATION[lang];
                Mailer.sendMail(emails, subject, html);
            }).catch((err) => {
                console.error(err);
            });
        }

        if (parcelAlerts.SECOND_FERTILIZATION.size > 0) {
            TemplateLoader.compileMailTemplate(lang +'/second-fertilization', {parcels: parcelAlerts.SECOND_FERTILIZATION}).then((html) => {
                var subject = subjects.SECOND_FERTILIZATION[lang];
                Mailer.sendMail(emails, subject, html);
            }).catch((err) => {
                console.error(err);
            });
        }

        if (parcelAlerts.INFECTION.size > 0) {
            TemplateLoader.compileMailTemplate(lang +'/infection', {parcels: parcelAlerts.INFECTION}).then((html) => {
                var subject = subjects.INFECTION[lang];
                Mailer.sendMail(emails, subject, html);
            }).catch((err) => {
                console.error(err);
            });
        }

    });
}

var subjects = {
    FIRST_FERTILIZATION: {
        en: "[ERMES] Optimal period for first nitrogen fertilization approaching",
        el: "[ERMES] Πλησιάζει η βέλτιστη περίοδος για την πρώτη επιφανειακή λίπανση",
        es: "[ERMES] Recomendación de periodo óptimo para la primera fertilización nitrogenada",
        it: "[ERMES] Il periodo ottimale per la prima fertilizzazione si sta avvicinando"
    },
    SECOND_FERTILIZATION: {
        en: "[ERMES] Optimal period for second nitrogen fertilization approaching",
        el: "[ERMES] Πλησιάζει η βέλτιστη περίοδος για τη δεύτερη επιφανειακή λίπανση",
        es: "[ERMES] Recomendación de periodo óptimo para la segunda fertilización",
        it: "[ERMES] Il periodo ottimale per la seconda fertilizzazione si sta avvicinando"
    },
    INFECTION: {
        en: "[ERMES] Possible period of high Rice Blast Infection Risk",
        el: "[ERMES] Πιθανή περίοδος υψηλή επικινδυνότητας για εμφάνιση Πυρικουλάριας",
        es: "[ERMES] Posible período de alto riesgo de infección de pedicularia",
        it: "[ERMES] Possibile periodi di elevato rishchio di infezione da Brusone rilevato"
    }
};