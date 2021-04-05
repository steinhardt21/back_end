/**
 * It is the collection that will keep the answer to the questions that
 * are done to the founder at the moment of the creation of a new project
 */
const mongoose = require('mongoose')

const Project_Analysis_Schema = new mongoose.Schema({
    Project:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    Analysis_Question:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Analysis_Question'
    },
    Answer:
    {
        type: String
    },
    Date_Inserted:
    {
        type: Date,
        default: Date.now
    }
})

module.exports = Project_Analysis = mongoose.model("Project_Analysis", Project_Analysis_Schema)