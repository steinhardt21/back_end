/**
 * Model of the Colection that links the Profile
 * of the user and the Industry that he is interested
 * in
 */

const mongoose = require('mongoose')

 const Profile_Industry_Schema = new mongoose.Schema({
     Profile:
     {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Profile'
     },
     Industry:
     {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Industry'
     }
 })

 module.exports = Profile_Industry = mongoose.model('Profile_Industry', Profile_Industry_Schema)