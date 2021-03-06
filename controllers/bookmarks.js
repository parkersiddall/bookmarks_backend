const bookmarksRouter = require('express').Router()
const Bookmark = require('../models/bookmark')
const miscFunctions = require('../utils/miscFunctions')
const redditScraper = require('../utils/redditScraper')
const User = require('../models/user')

// routes
bookmarksRouter.get('/', async (request, response, next) => {

  const user =  await User.findById(request.user)

  try {
    // get bookmarks for user
    const bookmarks = await Bookmark.find({user: request.user})

    // get reddit posts
    const redditPosts = await redditScraper.scrapeReddit(user.subreddit, bookmarks.length)

    // integrate reddit posts into bookmarks
    const bookmarksWithPosts = await miscFunctions.assignRedditPhoto(bookmarks, redditPosts)
    response.json(bookmarksWithPosts)

  } catch (error) {
    next(error)
  }
})

bookmarksRouter.post("/", async (request, response, next) => {
  try {
    const body = request.body
    const user = await User.findById(request.user)

    const bookmark = new Bookmark({
      name: body.name,
      url: body.url,
      category: body.category,
      notes: body.notes || null,
      date: new Date(),
      user: user._id,
      isFavorite: body.isFavorite || false
    })

    // save new bookmark
    let savedBookmark = await bookmark.save()

    // add the bookmark to the users list
    user.bookmarks = user.bookmarks.concat(savedBookmark._id)
    await user.save()

    // get a new reddit post, combine it with the bookmark
    const MongoToJson = savedBookmark.toJSON()
    const redditPost = await redditScraper.getPostForNewBookmark(user.subreddit, user.bookmarks.length)

    bookmarkWithRedditPost = {
      ...MongoToJson,
      redditPost: redditPost
    }

    response.json(bookmarkWithRedditPost)

  } catch (error) {
    next(error)
  }
})

bookmarksRouter.get('/:id', async (request, response, next) => {
  try {
    const bookmark = await Bookmark.findById(request.params.id)

    // check that id is valid and user is bookmark's owner
    if (!bookmark) {
      response.status(404).end()
    } else if (String(bookmark.user) !== String(request.user._id)) {
      return response.status(403).end()
    }
  
    response.json(bookmark)

  } catch (error) {
    next(error)
  }
})

bookmarksRouter.delete('/:id', async (request, response, next) => {
  try{
    const id = request.params.id
    bookmark = await Bookmark.findById(request.params.id)
  
    // check that id is valid and user is bookmark's owner
    if (!bookmark) {
      response.status(404).end()
    } else if (String(bookmark.user) !== String(request.user._id)) {
      return response.status(403).end()
    }

    // remove the bookmark from the users bookmarks list
    const user =  await User.findById(request.user)
    user.bookmarks = user.bookmarks.filter(bm => bm != id)
    user.save()

    // delete the bookmark
    const result = await Bookmark.findByIdAndRemove(request.params.id)
    response.status(204).end()

  } catch (error) {
    next(error)
  }
})

bookmarksRouter.put('/:id', async (request, response, next) => {
  try {
    const body = request.body
    const bookmark = await Bookmark.findById(request.params.id)
  
    // check that id is valid and user is bookmark's owner
    if (!bookmark) {
      response.status(404).end()
    } else if (String(bookmark.user) !== String(request.user._id)) {
      return response.status(403).end()
    }

    // TODO: sort out confusion with updating boolean value
    let isFavValue = bookmark.isFavorite
    if (typeof body.isFavorite !== 'undefined') {
      isFavValue = body.isFavorite
    } 

    // update the bookmark
    const updatedBookmark = {
      name: body.name || bookmark.name,
      url: body.url || bookmark.url,
      category: body.category || bookmark.category,
      notes: body.notes || bookmark.notes,
      user: bookmark.user, 
      isFavorite: isFavValue
    }

    // save the bookmark and return it to user
    const updatedBm = await Bookmark.findByIdAndUpdate(request.params.id, updatedBookmark, { new: true })
    response.json(updatedBm)

  } catch (error) {
    next(error)
  }
})

module.exports = bookmarksRouter