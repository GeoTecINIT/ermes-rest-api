var mongoose = require("mongoose");

var CropInfo = new mongoose.Schema({
    cropType: String,
    uploadingDate: Date,
    riceVariety: String,
    pudding: String,
    sowingPractice: String,
    date: Date
});

module.exports = mongoose.model("CropInfo", CropInfo);


