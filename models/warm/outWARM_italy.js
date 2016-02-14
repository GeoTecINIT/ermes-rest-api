var outWARM = require('../common_warm/outWARM');

module.exports = function(sequelize, Sequelize) {
  return outWARM(sequelize, Sequelize).schema('loc_it');
};