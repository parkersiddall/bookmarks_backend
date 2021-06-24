const config = require('../utils/config')
const jwt = require('jsonwebtoken')
const logger = require('./logger')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'Unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'TypeError') {
    return response.status(400).send({ error: 'Expected an object but found null.' })
  } else if (error.name === 'ValidationError') {
    return (response.status(400).send({error: error.message}))
  } else {
    return (response.status(400).send({ error: error.message }))
  }

  next(error)
}

const extractToken = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  } else {
    return response.status(401).json({ error: 'Authorization missing.' })
  }

  next()
}

const extractUser = async (request, response, next) => {  
  let decdecodedToken

  try {
    decodedToken = jwt.verify(request.token, config.JWT_SECRET)
  } catch (error) {
    next(error)
  }

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'Token missing or invalid.' })
  }

  const user = await User.findById(decodedToken.id)

  request.user = user
  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  extractToken,
  extractUser
}