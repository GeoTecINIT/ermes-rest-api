var path = require('path');
var express = require('express');
var router = express.Router();

var loggers = require('../initializers/loggers');

var sequelize = require('../initializers/db');
var User = sequelize.import(path.resolve('./models/local/user'));
var ActivationToken = sequelize.import(path.resolve('./models/local/activationToken'));

module.exports = function()
{

    router.get('/', function(req, res, next){
        var userId = req.query.userId;
        var token = req.query.token;

        sequelize.transaction((t) => {
            return ActivationToken.findOne({where: {userId: userId}, transaction: t}).then((activation) => {
                if (activation) {
                    return activation.getUser({transaction: t}).then((user) => {
                        if(user.active){
                            res.status(200).json({error: false, msg: "User already Accepted."});
                        } else if(token === activation.reject){
                            sendMail(user);
                            return activation.destroy({transaction: t});
                        } else if(token === activation.accept) {
                            return user.update({active: true}, {transaction: t}).then(() => {
                                sendMail(user);
                                res.status(200).json({error: false, msg: "User accepted."});
                                return activation.destroy({transaction: t});
                            });
                        } else {
                            throw new Error("Unauthorized");
                        }
                    });
                } else {
                    throw new Error("Unauthorized");
                }
            });
        }).catch((ex) => {
            res.status(404).json({errors: [{type: ex.name, message: ex.message}]});
        });
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
};

function sendMail(user){
    var email = user.email;
    var username = user.username;
    var accepted = user.active;

    var responseText;
    var message;
    if(accepted){
        message = username + " Welcome to ERMES!";
        responseText = username + " Accepted.";
    }
    else{
        message = username + " I'm sorry, your registration has been refused, ask the administrators.";
        responseText = username + " Refused.";

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
            console.error('[EMAIL]: '+ JSON.stringify(error));
            loggers.error.write('[' + new Date() + ' EMAIL]: '+ JSON.stringify(error) + '\n');
        } else {
            console.log('[EMAIL]: '+ JSON.stringify(info));
            loggers.info.write('[' + new Date() + ' EMAIL]: '+ JSON.stringify(info) + '\n');
        }
    });
}
