const mongoose = require('mongoose')

const Analysis_Question_Exposed_Schema = new mongoose.Schema({
  Question: {
    type: String
  },
  Analysis_Question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis_Question'
  }
})

module.exports = Analysis_Question_Exposed = mongoose.model('Analysis_Question_Exposed', Analysis_Question_Exposed_Schema)