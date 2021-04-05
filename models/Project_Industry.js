/**
 * It is the collection that links the Project
 * with the field industries with which it is linked
 */

 const mongoose = require('mongoose')

 const Project_Industry_Schema = new mongoose.Schema({
     Industry:{
         type: mongoose.Schema.Types.ObjectId,
         ref:'Industry'
     },
     Project:{
         type: mongoose.Schema.Types.ObjectId,
         ref:'Project'
     }
 })

 module.exports = Project_Industry = mongoose.model("Project_Industry", Project_Industry_Schema)