var sequelize = require('../initializers/db');

var User = sequelize.import('./user');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var Parcel = sequelize.define('parcel', {
    parcelId: {type: Sequelize.STRING, primaryKey: true},
    inDanger: {type: Sequelize.BOOLEAN, defaultValue: false}
  });

  // A user, if he or she is an owner, can hold many parcels and a parcel can belong to many users
  User.belongsToMany(Parcel, {as: 'Parcels', through: 'user_parcels', foreignKey: 'ownerId'});
  Parcel.belongsToMany(User, {as: 'Owners', through: 'user_parcels', foreignKey: 'parcelId'});

  return Parcel;
};