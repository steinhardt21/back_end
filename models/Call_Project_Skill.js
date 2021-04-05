/**
 * The link between the skills required by the
 * call of a project
 */

 const mongoose = require('mongoose')
 
 const Call_Project_Skill_Schema = new mongoose.Schema({
     Call_Project:{
         type: mongoose.Schema.Types.ObjectId,
         ref:'Call_Project'
     },
     Skill:{
         type: mongoose.Schema.Types.ObjectId,
         ref:'Skill'
     },
     Level_Skill:{
         type: String
     }
 })

 module.exports = Call_Project_Skill = mongoose.model('Call_Project_Skill', Call_Project_Skill_Schema)