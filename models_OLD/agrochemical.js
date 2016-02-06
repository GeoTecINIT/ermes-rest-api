var mongoose = require("mongoose");

var Agrochemical = new mongoose.Schema({
  date: Date,
  uploadingDate: Date,
  product: String,
  amount: Number
});

module.exports = mongoose.model("Agrochemical", Agrochemical);

//Example Crop
//{
//    usageDate: "08/06/2015",
//    product: "Mixed Product",
//    amount: 5
//}