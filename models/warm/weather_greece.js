var weather = require('../common_warm/weather');

module.exports = function(sequelize, Sequelize) {
  return weather(sequelize, Sequelize).schema('loc_gr');
};