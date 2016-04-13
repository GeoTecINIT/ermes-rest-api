var path = require('path');
var express = require('express');
var router = express.Router();

var sequelize = require('../initializers/db');
var User = sequelize.import(path.resolve('./models/local/user'));
var ActivationToken = sequelize.import(path.resolve('./models/local/activationToken'));

var TemplateLoader = require('../utils/template-loader');
var Mailer = require('../utils/mailer');

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
                            res.status(200).json({error: false, msg: "User rejected."});
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

    return router;
};

function sendMail(user){
    var subject = "ERMES Registration Response for user: " + user.username;

    var template;
    if (user.active) {
        template = "registration-accepted";
    } else {
        template = "registration-rejected";
    }

    TemplateLoader.compileMailTemplate(template, {user}).then((html) => {
        Mailer.sendMail([user.email], subject, html);
    }).catch((err) => {
        console.error(err);
    });
}
