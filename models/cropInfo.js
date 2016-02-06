var sequelize = require('../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
  "use strict";

  var CropInfo = sequelize.define('crop_info', {
    cropType: {type: Sequelize.STRING, allowNull: false},
    riceVariety: Sequelize.STRING, // Nullable
    pudding: Sequelize.STRING(4), // Nullable
    sowingPractice: Sequelize.STRING, // Nullable
    sowingDate: Sequelize.DATE // Nullable
  });

  // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
  CropInfo.belongsTo(Product, {foreignKey: {name: 'productId', type: Sequelize.INTEGER, primaryKey: true}});

  return CropInfo;
};