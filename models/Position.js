/**
 * It contains the list of position from
 * which the user can choose from when creating the profile
 * or when the calls for a project are made
 */

 const mongoose = require('mongoose')

 const PositionSchema = new mongoose.Schema({
     Position:
     {
         type: String
     },
     Date_Inserted:{
         type: Date,
         default: Date.now
     }
 })

 module.exports = Position = mongoose.model('Position', PositionSchema)