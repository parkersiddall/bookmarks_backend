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

app.use(express.json())
app.use(requestLogger)

// helper functions
const generateId = () => {
  const maxId = bookmarks.length > 0
    ? Math.max(...bookmarks.map(n => n.id))
    : 0
  return maxId + 1
}

// in memory DB for easy testing
let bookmarks = [
  {
    name: 'zBookmark 1',
    url: 'https://www.bookmark1.com',
    category: 'Category 1',
    notes: 'Lorem epsum 1.',
    id: 1
  },
  {
    name: 'Bookmark 2',
    url: 'https://www.bookmark2.com',
    category: 'Category 1',
    notes: 'Lorem epsum 2.',
    id: 2
  },
  {
    name: 'aBookmark 3',
    url: 'https://www.bookmark3.com',
    category: 'Category 2',
    notes: 'Lorem epsum 3.',
    id: 3
  },
  {
    name: 'ABookmark 4',
    url: 'https://www.bookmark4.com',
    category: 'Category 2',
    notes: 'Lorem epsum 4.',
    id: 4
  },
  {
    name: 'Bookmark 5',
    url: 'https://www.bookmark5.com',
    category: 'Category 3',
    notes: 'Lorem epsum 5.',
    id: 5
  },
  {
    name: 'Bookmark 6',
    url: 'https://www.bookmark6.com',
    category: 'Category 3',
    notes: 'Lorem epsum 6.',
    id: 6
  },
  {
    name: 'Bookmark 7',
    url: 'https://www.bookmark7.com',
    category: 'Category 4',
    notes: 'Lorem epsum 7.',
    id: 7
  },
  {
    name: 'Bookmark 8',
    url: 'https://www.bookmark8.com',
    category: 'Category 4',
    notes: 'Lorem epsum 8.',
    id: 8
  },
  {
    name: 'Bookmark 9',
    url: 'https://www.bookmark8.com',
    category: 'Category 5',
    notes: 'Lorem epsum 8.',
    id: 9
  }
]

app.get('/', (request, response) => {
  // will return React project
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/bookmarks', (request, response) => {
  response.json(bookmarks)
})

app.post("/api/bookmarks", (request, response) => {
  const body = request.body
  if (!body.name || !body.url || !body.category){
    return response.status(400).json({
      error: "Missing fields. Name, url, and category needed."
    })
  }

  const bookmark = {
    name: body.name,
    url: body.url,
    category: body.category,
    notes: body.notes || null,
    date: new Date(),
    id: generateId()
  }

  bookmarks = bookmarks.concat(bookmark)
  response.json(bookmark)
})

app.get('/api/bookmarks/:id', (request, response) => {
  const id = Number(request.params.id)
  const bookmark = bookmarks.find(bm => bm.id === id)

  if (bookmark) {
    response.json(bookmark)
  } else {
    response.status(404).json({Error: "No resource with this ID exists"}).end()
  }
})

app.delete('/api/bookmarks/:id', (request, response) => {
  const id = Number(request.params.id)
  bookmarks = bookmarks.filter(bookmark => bookmark.id !== id)
  response.status(204).end()
})

app.put('/api/bookmarks/:id', (request, response) => {

  // get body and id from request
  const body = request.body
  const id = Number(request.params.id)

  // pull out bookmark from list
  const bookmark = bookmarks.find(bm => bm.id === id)
  bookmarks = bookmarks.filter(bookmark => bookmark.id !== id)

  // update bookmark
  const updatedBookmark = {
    name: body.name || bookmark.name,
    url: body.url || bookmark.url,
    category: body.category || bookmark.category,
    notes: body.notes || bookmark.notes,
    date: bookmark.date,
    id: id
  }

  // save to list, return updates
  bookmarks = bookmarks.concat(updatedBookmark)
  response.json(updatedBookmark)
})

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})