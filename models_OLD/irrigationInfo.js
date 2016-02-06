var mongoose = require("mongoose");

var IrrigationInfo = new mongoose.Schema({
    startDate: Date,
    endDate: Date,
    quantityOfWaterMeasure: String,
    waterQuantity: Number,
    waterHours: Number,
    waterDepth: Number,
    uploadingDate: Date
});

module.exports = mongoose.model("IrrigationInfo", IrrigationInfo);

//Example IrrigationInfo
//{
//    startDate: "06/06/2015",
//    endDate: "07/06/2015",
//    quantityOfWaterMeasure: "m3/h",
//    quantityOfWaterValue: 0.5,
//    quantityOfWaterHours: 3,
//    waterDepth: 25
//}
