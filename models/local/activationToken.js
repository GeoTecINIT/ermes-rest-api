var sequelize = require('../../initializers/db');

var User = sequelize.import('./user');

module.exports = function(sequelize, Sequelize) {

  var ActivationToken = sequelize.define('activation_token', {
    userId: {type: Sequelize.INTEGER, primaryKey: true},
    accept: {type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4},
    reject: {type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4}
  });

  // A product belongs to the user that uploaded it
  ActivationToken.belongsTo(User, {as: 'user', foreignKey: 'userId'});

  return ActivationToken;
};