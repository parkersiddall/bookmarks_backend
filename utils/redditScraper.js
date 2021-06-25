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

module.exports = {
  scrapeReddit
}