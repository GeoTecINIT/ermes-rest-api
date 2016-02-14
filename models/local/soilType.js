var sequelize = require('../../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var SoilType = sequelize.define('soil_type', {
    productId: {type: Sequelize.INTEGER, primaryKey: true},
    soilTexture: {type: Sequelize.STRING, allowNull: false},
    organicMatter: {type: Sequelize.FLOAT, allowNull: false},
    ph: Sequelize.INTEGER, // Nullable
    observationDate: Sequelize.DATE // Nullable
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  SoilType.belongsTo(Product, {foreignKey: 'productId', constraints: false, scope: {type: 'soilType'}});
  Product.hasOne(SoilType, {foreignKey: 'productId', constraints: false, as: 'soilType'});

  return SoilType;
};
