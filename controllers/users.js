const customMiddleware = require('../utils/customMiddleware')
const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response, next) => {
  const body = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    passwordHash,
  })

  try {
    const savedUser = await user.save()
    response.json(savedUser)
  } catch (error) {
    next(error)
  }
})

// TODO: remove when app in completed
usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('bookmarks')
  response.json(users)
})

usersRouter.put('/settings', customMiddleware.extractToken, customMiddleware.extractUser, async (request, response) => {

  const body = request.body
  const user = await User.findById(request.user)

    // update the bookmark
    const updatedSettings = {
      prefersDark: body.prefersDark || user.prefersDark,
      subreddit: body.subreddit || user.subreddit
    }

    // save the bookmark and return it to user
    const updatedUser = await User.findByIdAndUpdate(user._id, updatedSettings, { new: true })
    response.json(updatedUser)

})



module.exports = usersRouter