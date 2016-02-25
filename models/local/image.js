var sequelize = require('../../initializers/db');
var User = sequelize.import('./user');

module.exports = function(sequelize, Sequelize) {

  var Image = sequelize.define('image', {
    file: {type: Sequelize.STRING, allowNull: false}
  });

  // A parcel can have many alerts
  Image.belongsTo(User, {as: 'user', foreignKey: 'userId'});

  return Image;
};