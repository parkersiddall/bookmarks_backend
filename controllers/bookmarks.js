const bookmarksRouter = require('express').Router()
const Bookmark = require('../models/bookmark')
const User = require('../models/user')

// routes
bookmarksRouter.get('/', async (request, response) => {
  const bookmarks = await Bookmark.find({})
    .populate('user', {username: 1, name: 1})
  response.json(bookmarks)
})

bookmarksRouter.post("/", async (request, response, next) => {
  const body = request.body

  const user = await User.findById(body.userId)

  const bookmark = new Bookmark({
    name: body.name,
    url: body.url,
    category: body.category,
    notes: body.notes || null,
    date: new Date(),
    user: user._id
  })

  try {
    const savedBookmark = await bookmark.save()
    user.bookmarks = user.bookmarks.concat(savedBookmark._id)

    await user.save()
    response.json(savedBookmark)

  } catch (error) {
    next(error)
  }
})

bookmarksRouter.get('/:id', async (request, response, next) => {
  try {
    const bookmark = await Bookmark.findById(request.params.id)
      .populate('user', {username: 1, name: 1})

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
  const id = request.params.id

  const bookmark = await Bookmark.findById(id)

  // this entire block will be simplified once user authentication is implemented
  if (bookmark) {
    const user =  await User.findById(bookmark.user)
    user.bookmarks = user.bookmarks.filter(bm => bm != id)
    user.save()
  }
  
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
        notes: body.notes || bookmark.notes,
        user: bookmark.user
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