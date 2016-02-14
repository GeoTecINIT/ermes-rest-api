/**
 * Created by alberto on 8/09/15.
 */
var u = require('underscore');

module.exports = {
    getSchema: function(region) {
        var regions = [
            {region: 'spain', schema: 'loc_es.out_warm'},
            {region: 'italy', schema: 'loc_it.out_warm'},
            {region: 'greece', schema: 'loc_gr.out_warm'}
        ];
        return (u.find(regions, function (area) {
            return area.region === region;
        })).schema;
    }
};