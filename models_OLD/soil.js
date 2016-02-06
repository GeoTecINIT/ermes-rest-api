
var mongoose = require("mongoose");

var Soil = new mongoose.Schema({
        soilTexture: String,
        organicMatter: Number,
        ph: Number,
        date: Date,
        uploadingDate: Date
    });

module.exports = mongoose.model("Soil", Soil);

//ExampleSoil
//{
//    soilTexture: Clay,
//    organicMatter: 35,
//    ph: 8,
//    updateDate: 02/05/2015
//}