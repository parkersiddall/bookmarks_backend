const bcrypt = require('bcrypt')
const config = require('../utils/config')
const jwt = require('jsonwebtoken')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const body = request.body
  console.log(body)

  const user = await User.findOne({username: body.username})
  console.log(user)
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.passwordHash)

  if (!user || !passwordCorrect) {
    return response.status(401).json({
      error: 'Invalid credentials.'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(userForToken, config.JWT_SECRET)

  response
    .status(200)
    .send({token, username: user.username})
})

module.exports = loginRouter