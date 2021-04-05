
 const mongoose = require('mongoose')

 const ContactUserSchema = new mongoose.Schema({
     name: {
         type: String,
         require: true
     },
     email:
     {
         type: String,
         require: true
     },
     timeCreated:{
         type: Date,
         default: Date.now
     }
 })
 
 module.exports = ContactUser = mongoose.model('ContactUser', ContactUserSchema)