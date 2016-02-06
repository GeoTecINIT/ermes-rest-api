var sequelize = require('../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var Fertilizer = sequelize.define('fertilizer', {
    name: {type: Sequelize.STRING, allowNull: false},
    quantity: {type: Sequelize.FLOAT, allowNull: false},
    nitrogenContent: Sequelize.FLOAT, // Nullable
    phosphorousContent: Sequelize.FLOAT, // Nullable
    potassiumContent: Sequelize.FLOAT, // Nullable
    observationDate: {type: Sequelize.DATE, allowNull: false}
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  Fertilizer.belongsTo(Product, {foreignKey: {name: 'productId', type: Sequelize.INTEGER, primaryKey: true}});

  return Fertilizer;
};