var sequelize = require('../../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var Observation = sequelize.define('observation', {
    productId: {type: Sequelize.INTEGER, primaryKey: true},
    comments: Sequelize.TEXT, // Nullable
    longitude: Sequelize.REAL, // Nullable
    latitude: Sequelize.REAL, // Nullable
    file: {type: Sequelize.STRING, allowNull: false, defaultValue: ''} // Nullable
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  Observation.belongsTo(Product, {foreignKey: 'productId', constraints: false, scope: {type: 'observation'}});
  Product.hasOne(Observation, {foreignKey: 'productId', constraints: false, as: 'observation'});

  return Observation;
};