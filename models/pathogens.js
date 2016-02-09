var sequelize = require('../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var Pathogen = sequelize.define('pathogen', {
    productId: {type: Sequelize.INTEGER, primaryKey: true},
    name: {type: Sequelize.STRING, allowNull: false},
    comments: Sequelize.TEXT, // Nullable
    file: Sequelize.STRING, // Nullable
    damage: Sequelize.INTEGER, // Nullable
    observationDate: {type: Sequelize.DATE, allowNull: false}
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  Pathogen.belongsTo(Product, {foreignKey: 'productId', constraints: false, scope: {type: 'pathogen'}});
  Product.hasOne(Pathogen, {foreignKey: 'productId', constraints: false, as: 'pathogen'});

  return Pathogen;
};