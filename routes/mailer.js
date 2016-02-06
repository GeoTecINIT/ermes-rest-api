"use strict";
var express = require('express');
var router = express.Router();
var _  = require('underscore');


var profiles = require('../user-config-files/profiles.json');
var options = require('../user-config-files/configOptions.json');
var operationalLayers = require('../user-config-files/operationalLayers.json');
var products = require('../user-config-files/products.json');
var parcelLayers = require('../user-config-files/parcelLayers.json');



module.exports = function()
{

    router.use(function(req, res, next){
        if(req.header("X-Auth-Key")) {
            var apiKey = req.header("X-Auth-Key");

            var username = apiKey.split(';')[0];
            var password = apiKey.split(';')[1];

            if(username!='ermesMailer' || password!="2016@Mailer"){
                return res.status(403).send("Forbidden Access");
            }
            else{
                next();
            }
        }
        else{
            res.status(403).send("Forbidden Access");
        }
    });

    router.post('/', function(req, res){
        var to = req.body.to;
        var subject = req.body.subject;
        var message = req.body.message;

        var nodemailer = require("nodemailer");

        var transporter = nodemailer.createTransport('smtps://ermesmailer@gmail.com:fp7ermes@smtp.gmail.com');

        var mailOptions = {
            from: 'ERMES <ermesmailer@gmail.com>', // sender address
            to: to,
            subject: subject,
            text: message
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
                return res.jsonp({"error": "Mail not send."});
            }
            res.jsonp({"success": "Mail Sended: " + info});
        });

    });

    return router;
}
