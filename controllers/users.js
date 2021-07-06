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

usersRouter.get('/me', customMiddleware.extractToken, customMiddleware.extractUser, async (request, response) => {
  const user = await User.findById(request.user)
  response.json(user)
})

usersRouter.put('/settings', customMiddleware.extractToken, customMiddleware.extractUser, async (request, response) => {

  const body = request.body
  const user = await User.findById(request.user)

  // TODO: sort out confusion with updating boolean value
  let prefersDark = user.prefersDark
  if (typeof body.prefersDark !== 'undefined') {
    prefersDark = body.prefersDark
  } 

  // update the bookmark
  const updatedSettings = {
    prefersDark: prefersDark,
    subreddit: body.subreddit || user.subreddit
  }

  // save the bookmark and return it to user
  const updatedUser = await User.findByIdAndUpdate(user._id, updatedSettings, { new: true })
  response.json(updatedUser)
})

usersRouter.put('/savedPhotos', customMiddleware.extractToken, customMiddleware.extractUser, async (request, response) => {
  const body = request.body
  const user = await User.findById(request.user)

  const alreadySaved = user.savedPhotos.filter(x => x.url === body.url)

  let savedPhotos
  if (alreadySaved.length !== 0) {
    // remove photo from list
    savedPhotos = user.savedPhotos.filter(x => x.url !== body.url)// with the post filtered out
  } else {
    // save the photo
    newSavedPhoto = {
      url: body.url,
      name: body.name
    }

    savedPhotos = user.savedPhotos.concat(newSavedPhoto)
  }

  // update the bookmark
  const updatedSavedPhotos = {
    savedPhotos: savedPhotos
  }

  // save the bookmark and return it to user
  const updatedUser = await User.findByIdAndUpdate(user._id, updatedSavedPhotos, { new: true })
  response.json(updatedUser)
})





module.exports = usersRouter