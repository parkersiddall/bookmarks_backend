const config = require('../utils/config')
const logger = require('../utils/logger')
const mongoose = require('mongoose')

const url = config.MONGO_CONNECTION_URL

logger.info('Connecting to', url)
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(result => {
    logger.info('Connected to MongoDB!')
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB :(')
  })

const bookmarkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  notes: String,
  date: {
    type: Date,
    required: true
  }
})

bookmarkSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Bookmark = mongoose.model('Bookmark', bookmarkSchema)

module.exports = mongoose.model('Bookmark', bookmarkSchema)