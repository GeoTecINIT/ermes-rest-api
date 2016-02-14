module.exports = function(sequelize, Sequelize) {
  "use strict";

  var User = sequelize.define('user', {
    userId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    username: {type: Sequelize.STRING, unique: true, allowNull: false,
      set: function(val) {
        this.setDataValue('username', val.toLowerCase());
      }
    },
    password: {type: Sequelize.STRING, allowNull: false},
    email: {type: Sequelize.STRING, allowNull: false, unique: true, validate: {isEmail: {msg: "FAKE_EMAIL"}}},
    region: {type: Sequelize.STRING(10), allowNull: false,
      set: function(val) {
        this.setDataValue('region', val.toLowerCase());
      }
    },
    profile: {type: Sequelize.STRING(30), allowNull: false,
      set: function(val) {
        this.setDataValue('profile', val.toLowerCase());
      }
    },
    type: {type: Sequelize.STRING(30), allowNull: false,
      set: function(val) {
        this.setDataValue('type', val.toLowerCase());
      }
    },
    language: {type: Sequelize.STRING(2), allowNull: false},
    active: {type: Sequelize.BOOLEAN, defaultValue: false},
    enableAlerts: {type: Sequelize.BOOLEAN, defaultValue: true},
    enableNotifications: {type: Sequelize.BOOLEAN, defaultValue: true},
    lastLongitude: Sequelize.DOUBLE, // Nullable
    lastLatitude: Sequelize.DOUBLE, // Nullable
    zoomLevel: Sequelize.INTEGER, // Nullable
    spatialReference: Sequelize.INTEGER // Nullable
  });

  // A user can have several collaborators
  User.belongsToMany(User, {as: 'owners', through: 'user_collaborators', foreignKey: 'collaboratorId'});
  User.belongsToMany(User, {as: 'collaborators', through: 'user_collaborators', foreignKey: 'ownerId'});

  return User;
};