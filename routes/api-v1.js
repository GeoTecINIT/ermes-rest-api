var path = require('path');
var express = require('express');
var router = express.Router();
var _ = require('underscore');
var sequelize = require('../initializers/db');

var administrators = require('../user-config-files/administratorsInfo.json');
var defaults = require('../helpers/config');
var User = sequelize.import(path.resolve('./models/user'));
var bCrypt = require('bcrypt-nodejs');

module.exports = function() {

    /*
     ###############################################################
     ########## From here: DEMILITARIZED AREA (unsecured) ##########
     ###############################################################
     */

    // Todo disable this
    /*router.get('/users', function(req, res) {
        User.findAll({include: [{all: true}]}).then((users) => {
            res.json({users: users});
        });
    });*/

    // User creation, no auth is needed -> A.K.A Signup
    router.post('/users', function (req, res) {
        sequelize.transaction((t) => {

            if (req.body.user) {
                var user = req.body.user;
                if (user.password) {
                    user.password = createHash(user.password);
                }
                if (user.region) {
                    user.language = calculateLanguage(user.region);
                    var lastPosition = defaults.regions[user.region];
                    _.extend(user, lastPosition);
                }
            }

            return User.create(req.body.user, {transaction: t}).then((user) => {
                var owner;
                if (user.type === "owner") {
                    return user;
                } else if (!(owner = req.body.user.collaboratesWith)) {
                    throw new Error("An owner cannot collaborate");
                } else {
                    return User.findOne({where: {username: { $like: owner.toLowerCase()}}},
                      {transaction: t}).then((owner) => {
                        if (owner) {
                            if (owner.type === 'owner') {
                                return user.setOwners([owner], {transaction: t}).then(() => {
                                    return user;
                                });
                            } else  {
                                throw new Error('Owner specified is not valid');
                            }
                        } else {
                            throw new Error('Owner does not exist');
                        }
                    });
                }
            });
        }).then((user) => {
            //sendMail(administrators, res, user);
            res.status(201).json({user: _.omit(user.get({plain: true}), ['userId', 'password', 'updatedAt', 'createdAt']) });
        }).catch((ex) => {
            console.error('ERROR CREATING USER: ' + ex);
            res.status(200).json({errors: {name: [ex.name, ex.message]}});
        });
    });

    /*
    ###############################################################
    ########### From here: MILITARIZED AREA (secured) #############
    ###############################################################
     */

    router.use(function(req, res, next){

        /*if(req.header("Authorization")) {
            var apiKey = new Buffer(req.header("Authorization").split(' ')[1], 'base64').toString('ascii');*/

        if(req.header("X-Auth-Key")) {
            var apiKey = req.header("X-Auth-Key");

            var username = apiKey.split(';')[0];
            var password = apiKey.split(';')[1];
            User.findOne({where: {username: username.toLowerCase()}}).then((user) => {
                if (!user) {
                    throw new Error('User not found');
                }
                else if (user) {
                    if (!isValidPassword(user, password)) {
                        throw new Error('Wrong password');
                    }
                    return user;
                }
            }).then((user) => {
                req.ERMES = {user: user};
                next();
            }).catch((ex) => {
                console.error('ERROR AUTHORIZING USER: ' + ex);
                //res.setHeader('WWW-Authenticate', 'Basic realm="API"');
                res.status(403).json({errors: {name: [ex.name, ex.message]}});
            });
        }
        else{
            //res.setHeader('WWW-Authenticate', 'Basic realm="API"');
            res.status(403).json({errors: {name: ['FORBIDDEN ACCESS']}});
        }
    });

    // TODO enable
    //var warm = require('./api-v1/warm');
    //router.use('/warm', warm());

    var users = require("./api-v1/users");
    router.use("/users", users());

    var products = require("./api-v1/products");
    router.use("/products", products());

    var parcels = require("./api-v1/parcels");
    router.use("/parcels", parcels());

    // TODO handle routing to product image files
    //var uploads = require("./api-v1/uploads")();
    //router.use("/uploads", uploads);

    return router;
};

function isValidPassword(user, password) {
    return bCrypt.compareSync(password, user.password);
}

// Generates hash using bCrypt
function createHash(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

function calculateLanguage(region){
    var regions = {
        'italy': 'it',
        'spain': 'es',
        'greece': 'el'
    };

    if(!regions[region]) {
        return 'en';
    }
    return regions[region];
}

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
