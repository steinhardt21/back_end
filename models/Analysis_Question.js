const mongoose = require('mongoose')

const Analysis_Question_Schema = new mongoose.Schema({
    Question:
    {
        type: String
    },
    Available:
    {
        type: Boolean,
        default: true
    },
    Date_Inserted:
    {
        type: Date,
        default: Date.now
    }
})

module.exports = Analysis_Question = mongoose.model('Analysis_Question', Analysis_Question_Schema)