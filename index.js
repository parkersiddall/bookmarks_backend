require('dotenv').config()
const Bookmark = require('./models/bookmark')
const express = require('express')

const app = express()

// middleware functions
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'Unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'TypeError'){
    return response.status(400).send({ error: 'Expected an object but found null.' })
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

app.get('/api/bookmarks', (request, response) => {
  Bookmark.find({}).then(bookmarks => {
    response.json(bookmarks)
  })
})

app.post("/api/bookmarks", (request, response) => {
  const body = request.body
  if (!body.name || !body.url || !body.category){
    return response.status(400).json({
      error: "Missing fields. Name, url, and category needed."
    })
  }

  const bookmark = new Bookmark({
    name: body.name,
    url: body.url,
    category: body.category,
    notes: body.notes || null,
    date: new Date()
  })

  bookmark.save().then(savedBookmark => {
    response.json(savedBookmark)
  })
})

app.get('/api/bookmarks/:id', (request, response, next) => {
  Bookmark.findById(request.params.id)
    .then(bookmark => {
      if (bookmark){
        response.json(bookmark)
      } else {
        response.status(404).end()
      }
  })
  .catch(error => next(error))
})

app.delete('/api/bookmarks/:id', (request, response, next) => {
  Bookmark.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/bookmarks/:id', (request, response) => {
  const body = request.body

  // pull out bookmark from MongoDB
  const bookmark = Bookmark.findById(request.params.id)

  // update bookmark
  const updatedBookmark = {
    name: body.name || bookmark.name,
    url: body.url || bookmark.url,
    category: body.category || bookmark.category,
    notes: body.notes || bookmark.notes
  }

  // save and return updates
  Bookmark.findByIdAndUpdate(request.params.id, updatedBookmark, { new: true })
    .then(updatedBm => {
      response.json(updatedBm)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})