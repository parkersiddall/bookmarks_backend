const Bookmark = require('./models/bookmark')
const config = require('./utils/config')
const logger = require('./utils/logger')
const express = require('express')

const app = express()

// middleware functions
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
    return (response.status(400).send({error: 'Issues validating data. Mandatory fields are likely missing.'}))
  }

  next(error)
}

// start up app with logging middleware
app.use(express.json())
app.use(requestLogger)

// api routes
app.get('/', (request, response) => {
  // will return React project
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/bookmarks', async (request, response) => {
  const bookmarks = await Bookmark.find({})
  response.json(bookmarks)
})

app.post("/api/bookmarks", async (request, response, next) => {
  const body = request.body

  const bookmark = new Bookmark({
    name: body.name,
    url: body.url,
    category: body.category,
    notes: body.notes || null,
    date: new Date()
  })

  try {
    const savedBookmark = await bookmark.save()
    response.json(savedBookmark)
  } catch (error) {
    next(error)
  }
})

app.get('/api/bookmarks/:id', async (request, response, next) => {
  try {
    const bookmark = await Bookmark.findById(request.params.id)
  } catch (error) {
    next(error)
  }

  if (bookmark) {
    response.json(bookmark)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/bookmarks/:id', async (request, response, next) => {
  try {
    const result = await Bookmark.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.put('/api/bookmarks/:id', async (request, response) => {
  const body = request.body

  // pull out bookmark from MongoDB
  const bookmark = await Bookmark.findById(request.params.id)

  // update bookmark
  const updatedBookmark = {
    name: body.name || bookmark.name,
    url: body.url || bookmark.url,
    category: body.category || bookmark.category,
    notes: body.notes || bookmark.notes
  }

  // save and return updates
  try {
    const updatedBm = await Bookmark.findByIdAndUpdate(request.params.id, updatedBookmark, { new: true })
    response.json(updatedBm)
  } catch (error) {
    next(error)
  }
})

app.use(unknownEndpoint)
app.use(errorHandler)

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})