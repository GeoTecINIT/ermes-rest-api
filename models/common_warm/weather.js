module.exports = function(sequelize, Sequelize) {
  return sequelize.define('weather', {
    gid: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, field: 'gid'},
    weatherId: {type: Sequelize.STRING, field: 'weather_id'},
    doy: {type: Sequelize.INTEGER, field: 'doy', allowNull: false},
    year: {type: Sequelize.INTEGER, field: 'year'},
    rainfall: {type: Sequelize.REAL, field: 'rainfall'},
    tmax: {type: Sequelize.REAL, field: 'tmax'},
    tmin: {type: Sequelize.REAL, field: 'tmin'},
    radiation: {type: Sequelize.REAL, field: 'radiation'},
    rhmax: {type: Sequelize.REAL, field: 'rhmax'},
    rhmin: {type: Sequelize.REAL, field: 'rhmin'},
    windSpeed: {type: Sequelize.REAL, field: 'wind_speed'},
    et0: {type: Sequelize.REAL, field: 'et0'},
    isForecast: {type: Sequelize.REAL, field: 'is_forecast'}
  }, {
    tableName: 'weather',
    timestamps: false
  });
};