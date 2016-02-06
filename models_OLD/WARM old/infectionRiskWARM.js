/**
 * Created by Alberto on 16/09/2015.
 */
var u = require('underscore');

module.exports = {
    createObject: function (data) {
        console.log(data);
        if (data[0]) {
            var reduced = u.map(data, function (row) {
                return {doy: row.doy,
                    year: row.year,
                    infectionRisk: row.infections}
            });
            return {parcelId: data[0].parcel_id, products: reduced};
        } else {
            console.log("No data provided");
            return "Data not found";
        }
    }
};