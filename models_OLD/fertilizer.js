var mongoose = require("mongoose");

var Fertilizer = new mongoose.Schema({
    date: Date,
    uploadingDate: Date,
    product: String,
    quantity: Number,
    nitrogenContent: Number,
    phosphorusContent: Number,
    potassiumContent: Number
});

module.exports = mongoose.model("Fertilizer", Fertilizer);

//Example Crop
//{
//    usageDate: "07/06/2015",
//    product: "UREA",
//    quantity: 5,
//    nitrogenContent: 0.8,
//    phosphorusContent: 1.6,
//    potassiumContent: 4.5
//}
