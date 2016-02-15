/**
 * Created by alberto on 7/09/15.
 */
var pg = require('pg');

module.exports = {
    init: function() {
        pg.defaults.user = "uji_test";
        pg.defaults.database = "ERMES_WARM";
        pg.defaults.password = "uji_wdb_pwd";
        pg.defaults.host = "155.253.20.74";
        pg.defaults.port = 5432;
        pg.defaults.poolSize = 10;
    },

    query: function (text, values, cb) {
        pg.connect(function(error, client, done) {
            if (error) {
                console.error("Could not connect to the server");
                done();
                return;
            }
            client.query(text, values, function (err, result) {
                done();
                cb(err, result);
            });
        });
    }
};