var sequelize = require('../../initializers/db');
var Parcel = sequelize.import('./parcel');
var User = sequelize.import('./user');

module.exports = function(sequelize, Sequelize) {

  var Alert = sequelize.define('alert', {
    value: {type: Sequelize.FLOAT, allowNull: false},
    type: {type: Sequelize.STRING, allowNull: false}
  });

  // A parcel can have many alerts
  Parcel.hasMany(Alert, {as: 'alerts', foreignKey: 'parcelId'});
  Alert.belongsTo(Parcel, {as: 'parcel', foreignKey: 'parcelId'});
  
  // A user can have many alerts
  User.hasMany(Alert, {as: 'alerts', foreignKey: 'userId'});
  Alert.belongsTo(User, {as: 'user', foreignKey: 'userId'});

  return Alert;
};