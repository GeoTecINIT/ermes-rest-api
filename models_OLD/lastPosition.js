var mongoose = require("mongoose");

var LastPosition = new mongoose.Schema({
    lastX: Number,
    lastY: Number,
    zoom: Number,
    spatialReference: String

});

module.exports = mongoose.model("LastPosition", LastPosition);

//Example Crop
//{
//    usageDate: "07/06/2015",
//    product: "UREA",
//    quantity: 5,
//    nitrogenContent: 0.8,
//    phosphorusContent: 1.6,
//    potassiumContent: 4.5
//}
