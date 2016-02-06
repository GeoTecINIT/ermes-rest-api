var sequelize = require('../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var Observation = sequelize.define('observation', {
    comments: Sequelize.TEXT, // Nullable
    file: {type: Sequelize.STRING, allowNull: false, defaultValue: ''} // Nullable
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  Observation.belongsTo(Product, {foreignKey: {name: 'productId', type: Sequelize.INTEGER, primaryKey: true}});

  return Observation;
};