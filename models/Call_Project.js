/**
 * It is the collection that keep the calls related
 * to a project
 */

 const mongoose = require('mongoose')
 
 const Call_Project_Schema = new mongoose.Schema({
    Status:{
        type: String,
        default: "PENDING"
    },
    Project:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Project'
    },
    Position:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Position'
    },
    Type_Colaboration:{
        type: String
    },
    City_Presence_Required:{
        type: String,
        default: ''
    },
    Skills:
    {
        type: [String],
        default: null
    },
    Description:
    {
        type: String,
        default: ''
    },
    Date_Inserted:{
        type: Date,
        default: Date.now
    }
 })

 module.exports = Call_Project = mongoose.model("Call_Project", Call_Project_Schema)