var sequelize = require('../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var SoilType = sequelize.define('soil_type', {
    soilTexture: {type: Sequelize.STRING, allowNull: false},
    organicMatter: {type: Sequelize.FLOAT, allowNull: false},
    ph: Sequelize.INTEGER, // Nullable
    observationDate: Sequelize.DATE // Nullable
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  SoilType.belongsTo(Product, {foreignKey: {name: 'productId', type: Sequelize.INTEGER, primaryKey: true}});

  return SoilType;
};
