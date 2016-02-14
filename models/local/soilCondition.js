var sequelize = require('../../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var SoilCondition = sequelize.define('soil_condition', {
    productId: {type: Sequelize.INTEGER, primaryKey: true},
    parcelStatus: {type: Sequelize.STRING, allowNull: false},
    observationDate: {type: Sequelize.DATE, allowNull: false}
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  SoilCondition.belongsTo(Product, {foreignKey: 'productId', constraints: false, scope: {type: 'soilCondition'}});
  Product.hasOne(SoilCondition, {foreignKey: 'productId', constraints: false, as: 'soilCondition'});

  return SoilCondition;
};