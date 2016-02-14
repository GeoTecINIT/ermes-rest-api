var sequelize = require('../../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var Irrigation = sequelize.define('irrigation', {
    productId: {type: Sequelize.INTEGER, primaryKey: true},
    startDate: {type: Sequelize.DATE, allowNull: false},
    endDate: Sequelize.DATE, // Nullable
    measureUnit: {type: Sequelize.STRING(6), allowNull: false},
    waterQuantity: {type: Sequelize.INTEGER, allowNull: false},
    waterHours: Sequelize.INTEGER, // Nullable
    waterHeight: Sequelize.INTEGER // Nullable
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  Irrigation.belongsTo(Product, {foreignKey: 'productId', constraints: false, scope: {type: 'irrigation'}});
  Product.hasOne(Irrigation, {foreignKey: 'productId', constraints: false, as: 'irrigation'});

  return Irrigation;
};