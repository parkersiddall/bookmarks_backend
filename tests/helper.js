// will add some initial bookmarks, users, and functions in here to 
// keep my test files clean

const testUser = {
  username: "Nic Cage",
  password: "independence_1776"
}

const testSavedPhoto = {
  url: "http://www.google.com",
  title: 'Test Save Photo'
}

const testBookmarks = [
  {
    "name": "Facebook",
    "url": "https://www.facebook.com",
    "category": "Social Media",
    "notes": null
  },
  {
    "name": "Twitter",
    "url": "https://www.twitter.com",
    "category": "Social Media",
    "notes": null
  },
  {
    "name": "Instagram",
    "url": "https://www.instagram.com",
    "category": "Social Media",
    "notes": null
  },
  {
    "name": "The New York Times",
    "url": "https://www.nyt.com",
    "category": "News",
    "notes": null
  },
  {
    "name": "The Guardian",
    "url": "https://www.theguardian.com",
    "category": "News",
    "notes": null
  },
  {
    "name": "Email",
    "url": "https://www.gmail.com",
    "category": "Personal",
    "notes": null
  }
]

module.exports = {
  testUser,
  testSavedPhoto,
  testBookmarks
}