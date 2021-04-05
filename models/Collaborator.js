/**
 * Modello per i collaboratori alla piattaforma
 * 
 */
const mongoose = require('mongoose')

const CollaboratorSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email:
    {
        type: String,
        require: true,
        unique: true
    },
    password:
    {
        type: String,
        require: true
    },
    role: // Il ruolo del collaboratore: administrator, analyst
    {
        type: String, 
        require: true
    },
    date:{
        type: Date,
        default: Date.now
    }
})

module.exports = Collaborator = mongoose.model('collaborator', CollaboratorSchema)