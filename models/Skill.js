/**
 * Collection that keeps the list of the skill
 */
const mongoose = require('mongoose')
const SkillSchema = new mongoose.Schema({
    Skill:
    {
        type: String
    },
    Date_Inserted:
    {
        type: Date,
        default: Date.now
    }
})

module.exports = Skill = mongoose.model("Skill", SkillSchema)