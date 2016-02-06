var mongoose = require("mongoose");

var ParcelStatus = new mongoose.Schema({
    parcelStatus: String,
    date: Date,
    uploadingDate: Date
});

module.exports = mongoose.model("ParcelStatus", ParcelStatus);

//Example ParcelStatus
//{
//  parcelStatus: Flooded,
//  updateDate: 02/05/2015
//}
