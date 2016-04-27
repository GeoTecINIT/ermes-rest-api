var parcels = require('../common_warm/parcels');

module.exports = function(sequelize, Sequelize) {
  return parcels(sequelize, Sequelize).schema('loc_gr');
};