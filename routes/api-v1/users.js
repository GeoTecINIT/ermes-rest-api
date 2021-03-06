var express = require('express');
var router = express.Router();
var bCrypt = require('bcrypt-nodejs');
var _ = require('underscore');
var path = require('path');
var sequelize = require('../../initializers/db');


var Parcel = sequelize.import(path.resolve('./models/local/parcel'));
var User = sequelize.import(path.resolve('./models/local/user'));
var Alert = sequelize.import(path.resolve('./models/local/alert'));
var ActivationToken = sequelize.import(path.resolve('./models/local/activationToken'));

var administrators = require('../../user-config-files/administratorsInfo.json');
var defaults = require('../../helpers/config');
var config = require('../../config/environment');
var loggers = require('../../initializers/loggers');

var TemplateLoader = require('../../utils/template-loader');
var Mailer = require('../../utils/mailer');

const userAttribsToOmit = ['userId', 'password', 'updatedAt', 'createdAt'];

module.exports = function(passport)
{

    // User creation, no auth is needed -> A.K.A Signup
    router.post('/', function (req, res) {
        sequelize.transaction((t) => {

            if (req.body.user) {
                var user = req.body.user;
                if (user.region) {
                    user.language = calculateLanguage(user.region);
                    var lastPosition = defaults.regions[user.region];
                    _.extend(user, lastPosition);
                }
            }

            return User.create(req.body.user, {transaction: t}).then((user) => {
                var owner = req.body.user.collaboratesWith;
                if (user.type === "owner" || user.type === "admin") {
                    return {user: user};
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
                            if (owner.type !== 'owner' || !owner.active) {
                                throw new Error('Owner specified is not valid');
                            } else if (owner.region !== user.region) {
                                throw new Error('Region has to be the same');
                            } else  {
                                return user.setOwners([owner], {transaction: t}).then(() => {
                                    return {user: user, owner: owner};
                                });
                            }
                        } else {
                            throw new Error('Owner does not exist');
                        }
                    });
                }
            });
        }).then((data) => {
            var user = data.user;

            if (data.owner) {
                var owner = data.owner;
                sendMail([owner.email], user);
            } else {
                sendMail(administrators, user);
            }
            res.status(201).json({user: _.omit(user.get({plain: true}), ['userId', 'password', 'updatedAt', 'createdAt']) });
        }).catch((ex) => {
            if (!ex.errors || !ex.errors.length) {
                console.error('ERROR CREATING USER: ' + ex);
                res.status(200).json({errors: [{type: ex.name, message: ex.message}]});
            } else {
                console.error('ERROR CREATING USER: ' + ex);
                var error = ex.errors[0];
                res.status(200).json({errors: [{type: ex.name, message: error.message}]});
            }
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
                var ownerIds = [user.userId];
                return getParcelForUser(ownerIds, plainUser, withParcels).then((response) => {
                    res.status(200).json(response);
                });
            } else if (user.type === 'collaborator') {
                return user.getOwners().then((owners) => {
                    var ownerIds = _.map(owners, (owner) => owner.userId);
                    return getParcelForUser(ownerIds, plainUser, withParcels);
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
        if (user.username !== req.params.username) {
            res.status(403).json({err: true, content: {name: 'Forbidden', msg: 'You cannot access to this profile'}});
        }
        else if (user.type === 'guest') {
            res.status(403).json({err: true, content: {name: 'Forbidden', msg: 'Guest users cannot be modified'}})
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
                    } else {
                        attributesToChange = _.omit(attributesToChange, ['password']);
                    }
                }

                return user.update(attributesToChange, {transaction: t});
            }).then(() => {
                res.status(200).json({user: _.omit(user.get({plain: true}), userAttribsToOmit)});
            }).catch((ex) => {
                if (!ex.errors || !ex.errors.length) {
                    console.error('ERROR CREATING USER: ' + ex);
                    res.status(200).json({errors: [{type: ex.name, message: ex.message}]});
                } else {
                    console.error('ERROR CREATING USER: ' + ex);
                    var error = ex.errors[0];
                    res.status(200).json({errors: [{type: ex.name, message: error.message}]});
                }
            });

        }

    });

    return router;

};

function getParcelForUser(ownerIds, plainUser, withParcels) {
    return Promise.all([
        Parcel.findAll({
            attributes: ['parcelId'],
            include: [
                {
                    model: User,
                    as: 'owners',
                    where: {userId: {$in: ownerIds}}
                }
            ]
        }),
        Parcel.findAll({
            attributes: ['parcelId'],
            include: [
                {
                    model: User,
                    as: 'owners',
                    where: {userId: {$in: ownerIds}}
                },
                {
                    model: Alert,
                    as: 'alerts',
                    where: {userId: {$in: ownerIds}}
                }
            ]
        })
    ]).then((result) => {
        var parcels = result[0];
        var parcelsInDanger = result[1];
        plainUser.parcels = _.map(parcels, (parcel) => parcel.parcelId);
        var response = {user: plainUser};
        if (withParcels === 'true') {
            var responseParcels = [];
            parcels.forEach((parcel) => {
                var parcelId = parcel.parcelId;
                var inDanger = _.find(parcelsInDanger, (parcelInDanger) => parcelInDanger.parcelId === parcelId) !== undefined;

                responseParcels.push({
                    parcelId,
                    inDanger
                });
            });
            response.parcels = responseParcels;
        }
        return response;
    });
}

// Calculates the language for a determinate region
function calculateLanguage(region){
    var regions = {
        'italy': 'it',
        'spain': 'es',
        'greece': 'el',
        'gambia': 'en',
        'gambia-srv': 'en'
    };

    if(!regions[region]) {
        return 'en';
    }
    return regions[region];
}


function sendMail(emails, user){

    ActivationToken.create({userId: user.userId}).then((token) => {
        var url = {
            accept: config.http.PROTOCOL + config.http.HOSTNAME + ":" + config.http.PORT + "/accept-registration?userId=" + user.userId + "&token=" + token.accept,
            reject: config.http.PROTOCOL + config.http.HOSTNAME + ":" + config.http.PORT + "/accept-registration?userId=" + user.userId + "&token=" + token.reject
        };

        var subject;
        var template;
        if (user.type === 'collaborator') {
            subject = "New ERMES Collaboration Proposal [user: " + user.username + "]";
            template = 'new-collaborator';
        } else {
            subject = "New ERMES Registration [user: " + user.username + "]";
            template = 'new-registration';
        }

        TemplateLoader.compileMailTemplate(template, {user, url}).then((html) => {
            Mailer.sendMail(emails, subject, html);
        }).catch((err) => {
            console.error(err);
        });
    });

}