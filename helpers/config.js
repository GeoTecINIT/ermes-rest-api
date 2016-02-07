module.exports = {
    proxyUrl: "/proxy",
    port: 6686,
    mongoDbUrl: 'mongodb://localhost/serverermesapp',
    regions: {
        'spain': {
            "lastLongitude": -0.3,
            "lastLatitude": 39.3,
            "zoomLevel": 15,
            "spatialReference": "4326"
        },
        'italy': {
            "lastLongitude": 8.64,
            "lastLatitude": 45.22,
            "zoomLevel": 15,
            "spatialReference": "4326"
        },
        'greece':{
            "lastLongitude": 22.76,
            "lastLatitude": 40.67,
            "zoomLevel": 14,
            "spatialReference": "4326"
        }
    },
    allLocalProducts: [
        "observations",
        "weeds",
        "diseases",
        "phatogens",
        "phenologies",
        "agrochemicals",
        "fertilizers",
        "irrigationInfos",
        "yields",
        "cropInfos",
        "parcelStatus",
        "soils"
    ]
};