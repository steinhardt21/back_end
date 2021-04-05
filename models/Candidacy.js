/**
 * This collection will keep the colections of the data
 * that are put in a new candidature
 */
const mongoose = require('mongoose')

const CandidacySchema = new mongoose.Schema({
    User:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    Call_Project:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Call_Project'
    },
    Feedback:
    {
        type: String
    },
    Status:
    {
        type: String,
        default: "Valutazione"
    },
    Motivational_Letter:{
        type: String
    },
    Type_Colaboration:{
        type: String
    },
    Date_Inserted:{
        type: Date,
        default: Date.now
    },
    Date_Closed:{
        type: Date
    }
})

module.exports = Candidacy = mongoose.model('Candidacy', CandidacySchema)