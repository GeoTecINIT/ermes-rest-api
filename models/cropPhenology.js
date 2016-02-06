var sequelize = require('../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var CropPhenology = sequelize.define('crop_phenology', {
    developmentStage: {type: Sequelize.STRING, allowNull: false},
    growthStage: Sequelize.STRING, // Nullable
    code: Sequelize.STRING, // Nullable
    observationDate: {type: Sequelize.DATE, allowNull: false}
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  CropPhenology.belongsTo(Product, {foreignKey: {name: 'productId', type: Sequelize.INTEGER, primaryKey: true}});

  return CropPhenology;
};
