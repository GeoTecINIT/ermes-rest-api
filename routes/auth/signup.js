var express = require('express');
var router = express.Router();
var administrators = require('../../user-config-files/administratorsInfo.json');
//var emailTemplate = require('../../helpers/templates/askForRegistration.tpl.html');

module.exports = function(passport){

    router.post('/', function(req, res, next) {
        passport.authenticate('signup', function(err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.send(false);
            }


            sendMail(administrators, res, user);


        })(req, res, next);
    });

    return router;
};

function sendMail(emails, res, user){
    console.log(emails);
    var to = emails;
    var subject = "New ERMES Registration";
    var message = "User " + user.username + " is trying to register. ACCEPT OR DECLINE (" + user.email + ")";

    var urlAccept = "http://ermes.dlsi.uji.es:6686/accept-registration?username=" + user.username + "&email=" + user.email + "&accepted=true";
    var urlDecline = "http://ermes.dlsi.uji.es:6686/accept-registration?username=" + user.username + "&email=" + user.email + "&accepted=false";

    var htmlText = "<p>" + message + "</p>";

    var buttonAccept = "<p><a href=" + urlAccept + ">ACCEPT USER</a></p>";
    var buttonDecline = "<p><a href=" + urlDecline + ">DECLINE USER</a></p>";

    var htmlContent =  "<br>" + htmlText + "<br>" + buttonAccept + "<br>" + buttonDecline;

    var nodemailer = require("nodemailer");

    var transporter = nodemailer.createTransport('smtps://ermesmailer@gmail.com:fp7ermes@smtp.gmail.com');

    var mailOptions = {
        from: 'ERMES <ermesmailer@gmail.com>', // sender address
        to: to,
        subject: subject,
        html: htmlContent,
        text: message
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            return res.jsonp({"error": "Problem sending confirmation mail."});
        }
        res.status(201).send(user.username);
    });

}
