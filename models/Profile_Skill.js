/**
 * Model of the Colection that links the Skills of the
 * Profile with the one that are in the Skill collection 
 */

 const mongoose = require('mongoose')

 const Profile_Skill_Schema = new mongoose.Schema({
    Profile:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },
    Skill:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
    },
    Date_Inserted:
    {
        type: Date,
        default: Date.now
    },
    Level_Skill:
    {
        type: String
    }
 })

 module.exports = Profile_Skill = mongoose.model('Profile_Skill', Profile_Skill_Schema)