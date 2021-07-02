const axios = require('axios')

const scrapeReddit = async (subreddit, limit) => {
  // function that calls Reddits open API given a the subreddir and a search limit. 
  const topPosts = await axios.get(`https://www.reddit.com/r/${subreddit}/top.json?limit=${limit}`)

  const topPostsCleaned = topPosts.data.data.children.map(post => {
    return {
      title: post.data.title,
      url: post.data.url
    }
  })

  return topPostsCleaned
}

const getPostForNewBookmark = async (subreddit, limit) => {
  // function returns the next reddit post in the feed based on current number of bookmarks (limit)
  const topPosts = await axios.get(`https://www.reddit.com/r/${subreddit}/top.json?limit=${limit + 1}`)

  const topPostsCleaned = topPosts.data.data.children.map(post => {
    return {
      title: post.data.title,
      url: post.data.url
    }
  })

  // indexes into the list to return only the final post that is currently not displayed
  return topPostsCleaned[limit]
}

module.exports = {
  scrapeReddit,
  getPostForNewBookmark
}