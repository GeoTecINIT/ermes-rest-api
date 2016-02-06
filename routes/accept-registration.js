"use strict";
var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var User = mongoose.model("User");



module.exports = function()
{

    router.get('/', function(req, res, next){
        var username = req.query.username;
        var email = req.query.email;
        var accepted = (req.query.accepted === "true");

        if(!accepted){
            sendMail(email, res, username, false);
        }
        else{
            User.findOne({'username': username}, function (err, user) {
                if (err) {
                    res.status(500).send(err.message);
                }
                else if (!user) {
                    res.status(401).send("User not found.");
                }
                else if (user) {
                    if(user.activeAccount){
                        res.status(401).send("User already Accepted.");
                    }
                    else{
                        user.activeAccount = true;
                        user.save();
                        sendMail(email, res, username, true);
                    }
                }
            });
        }


    });

    //router.use(function(req, res, next){
    //    if(req.header("X-Auth-Key")) {
    //        var apiKey = req.header("X-Auth-Key");
    //
    //        var auth1 = apiKey.split(';')[0];
    //        var auth2= apiKey.split(';')[1];
    //        if(! (auth1=="ermesAdmin" && auth2=="2016.admin") ){
    //            res.status(403).send("Forbidden Access");
    //        }
    //
    //        else{
    //            var username = req.body.username;
    //            var mail = req.body.email;
    //            var accepted = req.body.accepted;
    //
    //            if(!accepted){
    //                sendMail(mail, res, username, false);
    //            }
    //            else{
    //                User.findOne({'username': username}, function (err, user) {
    //                    if (err) {
    //                        res.status(500).send(err.message);
    //                    }
    //                    else if (!user) {
    //                        res.status(401).send("User not found.");
    //                    }
    //                    else if (user) {
    //                        user.activeAccount = true;
    //                        user.save();
    //                        sendMail(mail, res, username, true);
    //                    }
    //                });
    //            }
    //        }
    //    }
    //    else{
    //        res.status(403).send("Forbidden Access");
    //    }
    //});
    return router;
}

function sendMail(email, res, user, accepted){
    if(accepted){
        var message = user + " Welcome to ERMES!";
        var responseText = user + " Accepted."
    }
    else{
        var message = user + " I'm sorry, your registration has been refused, ask the administrators."
        var responseText = user + " Refused."

    }


    var to = email;
    var subject = "ERMES Registration Response";

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
            return res.jsonp({"error": "Problem sending confirmation mail."});
        }
        res.status(201).send(responseText);
    });

}
