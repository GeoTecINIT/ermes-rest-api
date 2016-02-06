/**
 * Created by Alberto on 16/09/2015.
 */

var warmDb = require('controllers/warmDb.js');
var model = require('models/infectionRiskWARM.js');

module.exports = {
    get: function(req, res, locale) {

        warmDb.query('SELECT parcel_id, doy, year, infections FROM ' + locale +
            ' WHERE parcel_id = $1 AND (doy BETWEEN $2 AND $3) AND year = $4',
            [req.query.parcelId, parseInt(req.query.doy), parseInt(req.query.doy)+4, parseInt(req.query.year)], function (err, result) {
                if (err || !result.rows[0]) {
                    var message = "The parcel you're requesting does not exists or has no info";
                    console.error(message);
                    res.status(200).send({error: true, message: message});
                } else {
                    //console.log(result);
                    res.status(200).send({error: false, res: model.createObject(result.rows)});
                }
            }
        );
    }
};