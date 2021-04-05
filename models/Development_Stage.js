/**
 * Collections that will keep what is defined
 * as stages for a company
 */
const mongoose = require('mongoose')
const Development_Stage_Schema = new mongoose.Schema({
    Development_Stage:{
        type: String
    },
    Date_Inserted:
    {
        type: Date,
        default: Date.now
    }
})

module.exports = Development_Stage = mongoose.model('Development_Stage', Development_Stage_Schema)