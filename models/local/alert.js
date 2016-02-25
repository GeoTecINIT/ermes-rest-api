var sequelize = require('../../initializers/db');
var Parcel = sequelize.import('./parcel');

module.exports = function(sequelize, Sequelize) {

  var Alert = sequelize.define('alert', {
    value: {type: Sequelize.FLOAT, allowNull: false},
    type: {type: Sequelize.STRING, allowNull: false}
  });

  // A parcel can have many alerts
  Parcel.hasMany(Alert, {as: 'alerts', foreignKey: 'parcelId'});
  Alert.belongsTo(Parcel, {as: 'parcel', foreignKey: 'parcelId'});

  return Alert;
};