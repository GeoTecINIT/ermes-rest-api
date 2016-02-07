var express = require('express');
var router = express.Router();
var bCrypt = require('bcrypt-nodejs');
var _ = require('underscore');
var path = require('path');
var sequelize = require('../../initializers/db');
var Parcel = sequelize.import(path.resolve('./models/parcel'));
var User = sequelize.import(path.resolve('./models/user'));

const userAttribsToOmit = ['userId', 'password', 'updatedAt', 'createdAt'];

module.exports = function()
{

    /*
     ###############################################################
     ############## USER POST is in /routes/api-v1.js ##############
     ###############################################################
     */

    router.get('/:username', function(req, res){
        var user = req.ERMES.user;
        if(user.username !== req.params.username.toLowerCase()){
            res.status(403).json({errors: {name: ['Forbidden', 'You cannot access to this profile']}});
        }
        else {
            var plainUser = _.omit(user.get({plain: true}), userAttribsToOmit);
            if (user.type === 'owner') {
              user.getParcels().then((parcels) => {
                    plainUser.parcels = _.map(parcels, (parcel) => parcel.parcelId);
                    res.status(200).json({'user': plainUser});
              });
          } else {
              sequelize.transaction((t) => {
                 return user.getOwners({transaction: t}).then((owners) => {
                     var ownerIds = _.map(owners, (owner) => owner.userId);
                     return Parcel.findAll({include: [{
                         model: User,
                         as: 'Owners',
                         where: {userId: {$in: ownerIds}}
                     }], transaction : t}).then((parcels) => {
                         plainUser.parcels =  _.map(parcels, (parcel) => parcel.parcelId);
                         return plainUser;
                     });
                 });
              }).then((user) => {
                  res.status(200).json({'user': user});
              }).catch((ex) => {
                  console.error('ERROR FINDING USER: ' + ex);
                  res.status(404).json({errors: {name: [ex.name, ex.message]}});
              });
          }
        }
    });

    router.put('/:username', function(req, res){
        var user = req.ERMES.user;
        if(user.username !== req.params.username){
            res.status(403).json({err: true, content: {name: "Forbidden", msg: 'You cannot access to this profile'}});
        }
        else {
            var attributesToChange = _.pick(req.body.user,
              ['password', 'email', 'profile', 'type', 'language', 'enableAlerts', 'enableNotifications', 'lastLongitude', 'lastLatitude', 'zoomLevel', 'spatialReference']
            );

            if (attributesToChange.password) {
                attributesToChange.password = createHash(attributesToChange.password);
            }

            user.update(attributesToChange).then(() => {
                res.status(200).json(_.omit(user.get({plain: true}), userAttribsToOmit));
            }).catch((ex) => {
                console.error('ERROR UPDATING USER: ' + ex);
                res.status(200).json({errors: {name: [ex.name, ex.message]}});
            });
        }

    });

    return router;

};

// Generates hash using bCrypt
function createHash(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}