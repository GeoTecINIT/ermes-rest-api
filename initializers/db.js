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
    console.log('\nInitializing local models...\n=================================');
    fs.readdir('./models/local', (err, files) => {

      files.forEach((file) => {
        sequelize.import(path.resolve('./models/local/' + file));
      });
      sequelize.sync(syncParameters)
        .then((res) => {
          console.log('=================================\nInitializing local models... DONE\n');
          resolve(res);
        })
        .catch((err) => {
          console.error('=================================\nInitializing local models... ERROR\n' + err);
          reject(err);
        });
    });
  });

  //return localInitializer;

  var warmInitializer =  new Promise(function (resolve, reject) {
    console.log('\nInitializing WARM models...\n=================================');
    fs.readdir('./models/warm', (err, files) => {

      files.forEach((file) => {
        if (!file) {
          sequelize.import(path.resolve('./models/warm/' + file));
        }
      });
      sequelize.sync()
        .then((res) => {
          console.log('=================================\nInitializing WARM models... DONE\n');
          resolve(res);
        })
        .catch((err) => {
          console.error('=================================\nInitializing WARM models... ERROR\n' + err);
          reject(err);
        });
    });
  });

  var modelInitializers = [localInitializer, warmInitializer];
  return Promise.all(modelInitializers);
};

module.exports = sequelize;

