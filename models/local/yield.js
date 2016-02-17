var sequelize = require('../../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var Yield = sequelize.define('yield', {
    productId: {type: Sequelize.INTEGER, primaryKey: true},
    yield: {type:Sequelize.FLOAT, allowNull: false}, // Nullable
    comments: Sequelize.TEXT, // Nullable
    grainMoisture: Sequelize.FLOAT, // Nullable
    observationDate: {type: Sequelize.DATE, allowNull: false}
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  Yield.belongsTo(Product, {foreignKey: 'productId', constraints: false, scope: {type: 'yield'}});
  Product.hasOne(Yield, {foreignKey: 'productId', constraints: false, as: 'yield'});

  return Yield;
};
