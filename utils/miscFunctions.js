const assignRedditPhoto = async (bookmarks, topPosts) => {
// function takes in two lists. Integrates to reddit posts into bookmarks

  for (let i = 0; i < bookmarks.length; i++) {
    // conver mongoose object to regular object so it can be manipulated
    bookmarks[i] = bookmarks[i].toObject()

    // assign a reddit post
    bookmarks[i].redditPost = topPosts[i]
  }

  return bookmarks
}

module.exports = {
  assignRedditPhoto
}
