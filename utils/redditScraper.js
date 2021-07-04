const axios = require('axios')

const scrapeReddit = async (subreddit, limit) => {
  // function that calls Reddits open API given a the subreddir and a search limit.
  let currentPost = null 
  let successful = []
  let unsuccessful = 0

  let totalCalls = 0

  // make an initial call
  const response = await axios.get(`https://www.reddit.com/r/${subreddit}/new.json?limit=${1}`)
  const post = response.data.data.children[0]
  
  currentPost = post.data.name
  totalCalls++

  if (post.data.post_hint === 'image') {
    savedPost = {
      title: post.data.title,
      url: post.data.url
    }

    
    successful.push(savedPost)
  }
  
  while (successful.length < limit) {
    const response = await axios.get(`https://www.reddit.com/r/${subreddit}/new.json?limit=${1}&after=${currentPost}`)
    totalCalls++
    
    const post = response.data.data.children[0]
    currentPost = post.data.name

    if (post.data.post_hint === 'image') {
      savedPost = {
        title: post.data.title,
        url: post.data.url
      }

      successful.push(savedPost)
    } else {
      unsuccessful++
    }
  }

  console.log('Total calls: ', totalCalls)
  console.log('Unsuccessful: ', unsuccessful)

  return successful
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