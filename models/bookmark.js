const mongoose = require('mongoose')

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
  },
  isFavorite: Boolean,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

module.exports = Bookmark