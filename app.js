const bookmarksRouter = require('./controllers/bookmarks')
const customMiddleware = require('./utils/customMiddleware')
const config = require('./utils/config')
const cors = require('cors')
const express = require('express')
const loginRouter = require('./controllers/login')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const usersRouter = require('./controllers/users')

// connect to MongoDB
let url = ''
switch (config.NODE_ENV) {
  case 'production':
    url =  config.MONGO_CONNECTION_URL
    break
  case 'development':
    url =  config.DEV_MONGO_CONNECTION_URL
    break
  case 'test':
    console.log('?')
    url =  config.TEST_MONGO_CONNECTION_URL
    break
}

logger.info(`Connecting to ${config.NODE_ENV} database:`, url)
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(result => {
    logger.info('Connected to MongoDB!')
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB :(')
  })

// build app
const app = express()
app.use(cors())
app.use(express.static('build'))

// middleware & routes
app.use(express.json())
app.use(customMiddleware.requestLogger)

// endpoints to reset DB if running frontend tests
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/forTesting')
  app.use('/api/testing', testingRouter)
}
app.use('/api/bookmarks', 
  customMiddleware.extractToken,
  customMiddleware.extractUser,
  bookmarksRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(customMiddleware.unknownEndpoint)
app.use(customMiddleware.errorHandler)

module.exports = app