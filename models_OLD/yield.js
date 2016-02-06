var mongoose = require("mongoose");

var Yield = new mongoose.Schema({
    date: Date,
    uploadingDate: Date,
    yield: Number,
    comments: String
});

module.exports = mongoose.model("Yield", Yield);

//Example Yield
//{
//    yield: 0.85,
//    comments: "Good comment",
//    harvestDate: 06/06/2015
//}
