module.exports = function(sequelize, Sequelize) {
  return sequelize.define('parcels', {
    gid: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, field: 'gid'},
    parcelId: {type: Sequelize.STRING, field: 'parcel_id'},
    nuts3: {type: Sequelize.STRING, field: 'nuts_3'},
    lau2Nat: {type: Sequelize.STRING, field: 'lau2_nat'},
    parcelNum: {type: Sequelize.INTEGER, field: 'parcel_num'},
    name2Lat: {type: Sequelize.STRING, field: 'name_2_lat'},
    polygon: {type: Sequelize.STRING, field: 'polygon'},
    parcel: {type: Sequelize.STRING, field: 'parcel'},
    owner: {type: Sequelize.STRING, field: 'owner'},
    area: {type: Sequelize.INTEGER, field: 'area'},
    fieldName: {type: Sequelize.STRING, field: 'field_name'},
    weatherId: {type: Sequelize.STRING, field: 'weather_id'},
    soilType: {type: Sequelize.STRING, field: 'soil_type'},
    intId: {type: Sequelize.INTEGER, field: 'int_id~'}
  }, {
    tableName: 'parcels',
    timestamps: false
  });
};
