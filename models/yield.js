var sequelize = require('../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var Yield = sequelize.define('yield', {
    yield: {type:Sequelize.FLOAT, allowNull: false}, // Nullable
    comments: Sequelize.TEXT, // Nullable
    harvestDate: {type: Sequelize.DATE, allowNull: false}
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  Yield.belongsTo(Product, {foreignKey: {name: 'productId', type: Sequelize.INTEGER, primaryKey: true}});

  return Yield;
};
