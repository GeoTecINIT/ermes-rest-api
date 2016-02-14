var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var config = require('../config/environment');

var sequelize = new Sequelize(config.SQL.db, config.SQL.auth.user, config.SQL.auth.pass, {
  host: config.SQL.host,
  dialect: 'postgres',

  pool: {
    max: 25,
    min: 0,
    idle: 10000
  },

  define: {schema: config.SQL.defaultSchema}
});

sequelize.initModels = function(syncParameters) {
  "use strict";

  // Initialize local models
  var localInitializer =  new Promise(function (resolve, reject) {
    console.log('\t* Initializing local models...');
    fs.readdir('./models/local', (err, files) => {

      files.forEach((file) => {
        sequelize.import(path.resolve('./models/local/' + file));
      });
      resolve();
    });
  });

  //return localInitializer;

  var warmInitializer =  new Promise(function (resolve, reject) {
    console.log('\t* Initializing WARM models...');
    fs.readdir('./models/warm', (err, files) => {

      files.forEach((file) => {
        if (!file) { // TODO Remove this
          sequelize.import(path.resolve('./models/warm/' + file));
        }
      });
      resolve();
    });
  });

  var modelInitializers = [localInitializer, warmInitializer];
  return Promise.all(modelInitializers).then(() => {
    return sequelize.sync(syncParameters)
      .then(() => {
        console.log('\n\t-> DONE Initializing models');
      })
      .catch((err) => {
        console.error('\n\t-> ERROR Initializing models' + err);
      });
  });
};

module.exports = sequelize;

