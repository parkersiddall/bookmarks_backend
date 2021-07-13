const router = require('express').Router()
const Bookmark = require('../models/bookmark')
const User = require('../models/user')

router.post('/reset', async (request, response) => {
  await Bookmark.deleteMany({})
  await User.deleteMany({})

  response.status(204).end()
})

module.exports = router