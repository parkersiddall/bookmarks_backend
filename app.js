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
const url = config.MONGO_CONNECTION_URL
logger.info('Connecting to', url)
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

// middleware & routes
app.use(express.json())
app.use(customMiddleware.requestLogger)

app.use('/api/bookmarks', 
  customMiddleware.extractToken,
  customMiddleware.extractUser,
  bookmarksRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(customMiddleware.unknownEndpoint)
app.use(customMiddleware.errorHandler)

module.exports = app