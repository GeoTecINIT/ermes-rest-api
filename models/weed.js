var sequelize = require('../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var Weed = sequelize.define('weed', {
    name: {type: Sequelize.STRING, allowNull: false},
    comments: Sequelize.TEXT, // Nullable
    file: Sequelize.STRING, // Nullable
    percentCovered: Sequelize.INTEGER, // Nullable
    observationDate: {type: Sequelize.DATE, allowNull: false}
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  Weed.belongsTo(Product, {foreignKey: {name: 'productId', type: Sequelize.INTEGER, primaryKey: true}});

  return Weed;
};