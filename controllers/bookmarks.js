const bookmarksRouter = require('express').Router()
const Bookmark = require('../models/bookmark')

// routes
bookmarksRouter.get('/', async (request, response) => {
  const bookmarks = await Bookmark.find({})
  response.json(bookmarks)
})

bookmarksRouter.post("/", async (request, response, next) => {
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

bookmarksRouter.get('/:id', async (request, response, next) => {
  try {
    const bookmark = await Bookmark.findById(request.params.id)

    if (bookmark) {
      response.json(bookmark)
    } else {
      response.status(404).end()
    }

  } catch (error) {
    next(error)
  }
})

bookmarksRouter.delete('/:id', async (request, response, next) => {
  try {
    const result = await Bookmark.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

bookmarksRouter.put('/:id', async (request, response) => {
  const body = request.body

  // pull out bookmark from MongoDB
  const bookmark = await Bookmark.findById(request.params.id)

  if (bookmark) {
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
  } else {
    response.status(404).end()
  }
})

module.exports = bookmarksRouter