var sequelize = require('../../initializers/db');

var User = sequelize.import('./user');

module.exports = function(sequelize, Sequelize) {

    var CustomOption = sequelize.define('custom_option', {
        productType: {type: Sequelize.STRING, allowNull: false},
        value: {type: Sequelize.STRING, allowNull: false},
        text: {type: Sequelize.STRING, allowNull: false}
    });

    // A product belongs to the user that uploaded it
    CustomOption.belongsTo(User, {as: 'user', foreignKey: 'userId'});
    User.hasMany(CustomOption, {as: 'options', foreignKey: 'userId'});

    return CustomOption;
};