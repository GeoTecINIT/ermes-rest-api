module.exports = {
    proxyUrl: "/proxy",
    port: 6686,
    mongoDbUrl: 'mongodb://localhost/serverermesapp',
    regions: {
        'spain': {
            "lastX": -0.3,
            "lastY": 39.3,
            "zoom": 15,
            "spatialReference": "4326"
        },
        'italy': {
            "lastX": 8.64,
            "lastY": 45.22,
            "zoom": 15,
            "spatialReference": "4326"
        },
        'greece':{
            "lastX": 22.76,
            "lastY": 40.67,
            "zoom": 14,
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
}