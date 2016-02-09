var sequelize = require('../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var CropPhenology = sequelize.define('crop_phenology', {
    productId: {type: Sequelize.INTEGER, primaryKey: true},
    developmentStage: {type: Sequelize.STRING, allowNull: false},
    growthStage: Sequelize.STRING, // Nullable
    code: Sequelize.STRING, // Nullable
    observationDate: {type: Sequelize.DATE, allowNull: false}
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  CropPhenology.belongsTo(Product, {foreignKey: 'productId', constraints: false, scope: {type: 'cropPhenology'}});
  Product.hasOne(CropPhenology, {foreignKey: 'productId', constraints: false, as: 'cropPhenology'});

  return CropPhenology;
};
