var sequelize = require('../../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var Weed = sequelize.define('weed', {
    productId: {type: Sequelize.INTEGER, primaryKey: true},
    name: {type: Sequelize.STRING, allowNull: false},
    comments: Sequelize.TEXT, // Nullable
    file: Sequelize.STRING, // Nullable
    percentCovered: Sequelize.INTEGER, // Nullable
    observationDate: {type: Sequelize.DATE, allowNull: false}
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  Weed.belongsTo(Product, {foreignKey: 'productId', constraints: false, scope: {type: 'weed'}});
  Product.hasOne(Weed, {foreignKey: 'productId', constraints: false, as: 'weed'});

  return Weed;
};