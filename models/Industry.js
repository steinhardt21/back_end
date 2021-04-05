/**
 * It is the collection that keeps the list of the
 * industry fields
 */
const mongoose = require('mongoose')

const IndustrySchema = new mongoose.Schema({
    Industry:{
        type: String
    },
    Date_Inserted:
    {
        type: Date,
        default: Date.now
    }
})

module.exports = Industry = mongoose.model("Industry", IndustrySchema)