/**
 * This collection keeps the link between projects
 * and the users that are its owners
 */

 const mongoose = require('mongoose')

 const Project_Owner_Schema = new mongoose.Schema({
     User:
     {
         type: mongoose.Schema.Types.ObjectId,
         ref:'User'
     },
     Project:
     {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Project'
     }
 })

 module.exports = Project_Owner = mongoose.model("Project_Owner", Project_Owner_Schema)