const Bookmark = require('./models/bookmark')
const bookmarksRouter = require('./controllers/bookmarks')
const customMiddleware = require('./utils/customMiddleware')
const config = require('./utils/config')
const logger = require('./utils/logger')
const express = require('express')

const app = express()

// start up app with logging middleware
app.use(express.json())
app.use(customMiddleware.requestLogger)

app.use('/api/bookmarks', bookmarksRouter)

app.use(customMiddleware.unknownEndpoint)
app.use(customMiddleware.errorHandler)

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})