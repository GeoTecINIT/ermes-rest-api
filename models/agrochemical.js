var sequelize = require('../initializers/db');

var Product = sequelize.import('./product');

module.exports = function(sequelize, Sequelize) {
    "use strict";

    var Agrochemical = sequelize.define('agrochemical', {
        name: {type: Sequelize.STRING, allowNull: false},
        amount: {type: Sequelize.FLOAT, allowNull: false},
        observationDate: {type: Sequelize.DATE, allowNull: false}
    });

    // Append general product info like: upload date, user who uploaded, parcels where applied, etc.
    //Agrochemical.belongsTo(Product, {foreignKey: {name: 'productId', type: Sequelize.INTEGER, primaryKey: true}});
    Agrochemical.belongsTo(Product, {foreignKey: 'productId', constraints: false, scope: {type: 'agrochemical'}});
    Product.hasOne(Agrochemical, {foreignKey: 'productId', constraints: false, as: 'agrochemical'});

    return Agrochemical;
};
