var express = require('express');
var router = express.Router();
var bCrypt = require('bcrypt-nodejs');
var _ = require('underscore');
var path = require('path');
var sequelize = require('../../initializers/db');


var Parcel = sequelize.import(path.resolve('./models/local/parcel'));
var User = sequelize.import(path.resolve('./models/local/user'));

var administrators = require('../../user-config-files/administratorsInfo.json');
var defaults = require('../../helpers/config');

const userAttribsToOmit = ['userId', 'password', 'updatedAt', 'createdAt'];

module.exports = function(passport)
{

    // User creation, no auth is needed -> A.K.A Signup
    router.post('/', function (req, res) {
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
                var owner = req.body.user.collaboratesWith;
                if (user.type === "owner" || user.type === "admin") {
                    return user;
                } else if (user.type !== "collaborator") {
                    throw new Error("Invalid user type");
                } else if (!owner) {
                    throw new Error("A collaborator needs an owner to collaborate with");
                } else if ((owner = owner.toLowerCase().trim()) === user.username) {
                    throw new Error("You cannot collaborate with yourself");
                } else {
                    return User.findOne({where: {username: { $like: owner}}},
                      {transaction: t}).then((owner) => {
                        if (owner) {
                            if (owner.type !== 'owner') {
                                throw new Error('Owner specified is not valid');
                            } else if (owner.region !== user.region) {
                                throw new Error('Region has to be the same');
                            } else  {
                                return user.setOwners([owner], {transaction: t}).then(() => {
                                    return user;
                                });
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
            res.status(200).json({errors: [{type: ex.name, message: ex.message}]});
        });
    });

    /**
     * @URLParam username user from whom we want to retrieve the profile
     * @QueryParam withParcels true value adds also metadata from the user parcels with its danger status
     */
    router.get('/:username', passport.authenticate('login', { session: false }), function(req, res){
        var user = req.user;
        var withParcels = req.query.withParcels;
        if(user.username !== req.params.username.toLowerCase()){
            res.status(403).json({errors: [{type: 'Forbidden', message: 'You cannot access to this profile'}]});
        }
        else {
            var plainUser = _.omit(user.get({plain: true}), userAttribsToOmit);
            if (user.type === 'owner') {
              user.getParcels().then((parcels) => {
                  plainUser.parcels = _.map(parcels, (parcel) => parcel.parcelId);
                  var response = {user: plainUser};
                  if (withParcels === 'true') {
                      var responseParcels = [];
                      parcels.forEach((parcel) => {
                          responseParcels.push(_.pick(parcel, ['parcelId', 'inDanger']));
                      });
                      response.parcels = responseParcels;
                  }
                  res.status(200).json(response);
              });
            } else if (user.type === 'collaborator') {
                 return user.getOwners().then((owners) => {
                     var ownerIds = _.map(owners, (owner) => owner.userId);
                     return Parcel.findAll({include: [
                         {
                             model: User,
                             as: 'owners',
                             where: {userId: {$in: ownerIds}}
                         }
                     ]}).then((parcels) => {
                         plainUser.parcels =  _.map(parcels, (parcel) => parcel.parcelId);
                         var response = {user: plainUser};
                         if (withParcels === 'true') {
                             var responseParcels = [];
                             parcels.forEach((parcel) => {
                                 responseParcels.push(_.pick(parcel, ['parcelId', 'inDanger']));
                             });
                             response.parcels = responseParcels;
                         }
                         return response;
                     });
                 }).then((response) => {
                      res.status(200).json(response);
                 }).catch((ex) => {
                      console.error('ERROR FINDING USER: ' + ex);
                      res.status(404).json(({errors: [{type: ex.name, message: ex.message}]}));
                 });
            } else { // Guest by default
                res.status(200).json({user: plainUser});
            }
        }
    });

    router.put('/:username', passport.authenticate('login', {session: false}), function(req, res){
        var user = req.user;
        if(user.username !== req.params.username){
            res.status(403).json({err: true, content: {name: 'Forbidden', msg: 'You cannot access to this profile'}});
        }
        else {
            var attributesToChange = _.pick(req.body.user,
              ['password', 'oldPassword', 'email', 'profile', 'type', 'language', 'enableAlerts', 'enableNotifications', 'lastLongitude', 'lastLatitude', 'zoomLevel', 'spatialReference']
            );

            sequelize.transaction((t) => {
                if (attributesToChange.password) {
                    if (attributesToChange.oldPassword) {
                        if (!bCrypt.compareSync(attributesToChange.oldPassword, user.password)) {
                            throw new Error('PASSWORD_MISMATCH');
                        }
                        attributesToChange.password = createHash(attributesToChange.password);
                    } else {
                        attributesToChange = _.omit(attributesToChange, ['password']);
                    }
                }

                return user.update(attributesToChange, {transaction: t});
            }).then(() => {
                res.status(200).json({user: _.omit(user.get({plain: true}), userAttribsToOmit)});
            }).catch((ex) => {
                console.error('ERROR UPDATING USER: ' + ex);
                res.status(200).json(({errors: [{type: ex.name, message: ex.message}]}));
            });

        }

    });

    return router;

};

// Generates hash using bCrypt
function createHash(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

// Calculates the language for a determinate region
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

// Send a confirmation email
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