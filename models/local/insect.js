var sequelize = require('../../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var Insect = sequelize.define('insect', {
    productId: {type: Sequelize.INTEGER, primaryKey: true},
    name: {type: Sequelize.STRING, allowNull: false},
    comments: Sequelize.TEXT, // Nullable
    file: Sequelize.STRING, // Nullable
    damage: Sequelize.INTEGER, // Nullable
    observationDate: {type: Sequelize.DATE, allowNull: false}
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  Insect.belongsTo(Product, {foreignKey: 'productId', constraints: false, scope: {type: 'insect'}});
  Product.hasOne(Insect, {foreignKey: 'productId', constraints: false, as: 'insect'});

  return Insect;
};