const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ProjectSchema = new Schema(
    {
        Status:{
            type: String,
            default: 'PENDING'
        },
        Name: 
        {
            type: String
        },
        Image:
        {
            data: Buffer,
            contentType: String
        },
        // Descrizione dell'idea
        Description:{
            type: String
        },
        // Sede
        Headquarter:{
            type: String
        },
        // Fase di sviluppo
        Development_Stage:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Development_Stage',
            default: null
        },
        Date_Inserted:
        {
            type: Date,
            default: Date.now
        },
        Date_Deadline:
        {
            type: Date,
            default: Date.now
        },
        Date_Removed:
        {
            type: Date,
            default: null
        }
    }
)

module.exports = Project = mongoose.model('Project', ProjectSchema)