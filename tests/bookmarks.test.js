const app = require('../app')
const mongoose = require('mongoose')
const helper = require('./helper')
const supertest = require('supertest')
const User = require('../models/user')
const Bookmark = require('../models/bookmark')

const api = supertest(app)
let token = null

beforeEach(async () => {
  // clear test database
  await User.deleteMany({})
  await Bookmark.deleteMany({})

  // create a user
  const response = await api
    .post('/api/users')
    .send(helper.testUser)

  // log user in and save token
  const loginResponse = await api
    .post('/api/login')
    .send(helper.testUser)

  token = loginResponse.body.token
})

describe('Get bookmarks', () => {
  test('Unauthenticated users get 401', async () => {
    const response = await api.get('/api/bookmarks/')
    
    expect(response.status === 401)
  })

  test('Authenticated receive 200 status', async () => {
    const response = await api.get('/api/bookmarks/')
      .set('Authorization', `Bearer ${token}`)
    
    expect(response.status === 200)
  })

  test('Bookmarks include reddit posts', async () => {
    const response = await api.get('/api/bookmarks/')
      .set('Authorization', `Bearer ${token}`)
    
    expect(response.body.redditPost)
  })
})

describe('Add a bookmark', () => {
  test('Unauthenticated users get 401', async () => {
    const response = await api.post('/api/bookmarks/')
      .send(helper.testBookmarks[0])
    
    expect(response.status === 401)
  })

  test('Authenticated users received OK after adding bookmark', async () => {
    const response = await api.post('/api/bookmarks/')
      .send(helper.testBookmarks[0])
  
    expect(response.status === 200)
  })

  test('Added bookmarks return a reddit post', async () => {
    const response = await api.post('/api/bookmarks/')
      .send(helper.testBookmarks[0])
  
    expect(response.status === 200)
    expect(response.body.redditPost)
  })

  test('Bookmarks without name get error', async () => {
    const noName = {
      "url": "https://www.facebook.com",
      "category": "Social Media",
      "notes": null
    }
    const response = await api.post('/api/bookmarks/')
      .send(noName)

    expect(response.status !== 200)
  })

  test('Bookmarks without url get error', async () => {
    const noName = {
      "name": "Facebook",
      "category": "Social Media",
      "notes": null
    }
    const response = await api.post('/api/bookmarks/')
      .send(noName)

    expect(response.status !== 200)
  })

  test('Bookmarks without category get error', async () => {
    const noName = {
      "name": "Facebook",
      "url": "https://www.facebook.com",
      "notes": null
    }
    const response = await api.post('/api/bookmarks/')
      .send(noName)

    expect(response.status !== 200)
  })

  test('Bookmark is actually saved to DB', async () => {
    const response = await api.post('/api/bookmarks/')
      .send(helper.testBookmarks[0])
  
    const bookmarks = await Bookmark.find({})
    expect(bookmarks.length === 1)
  })
})

describe('Get bookmarks by ID', () => {
  test('Unauthenticated user cannot get specific bookmark', async () => {
    // post a legitimate bookmark
    const response = await api.post('/api/bookmarks/')
      .send(helper.testBookmarks[0])

    // modify the token so that it is incorrect
    token[0] = 'x'
    token[2] = 'x'

    // unauthenticated user cannot retreive bookmark
    const notCorrectUser = await api.get(`/api/bookmarks/${response.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(notCorrectUser.status !== 200)
  })

  test('Authenticated user can get specific bookmark', async () => {
    // post a legitimate bookmark
    const response = await api.post('/api/bookmarks/')
      .send(helper.testBookmarks[0])

    // authenticated user cann retreive bookmark
    const correctUser = await api.get(`/api/bookmarks/${response.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(correctUser.status === 200)
    expect(correctUser.body.name === helper.testBookmarks[0].name)
  })
})

describe('Deleting a bookmark', () => {
  test('Unauthenticated user cannot delete bookmark', async () => {
    // post a legitimate bookmark
    const response = await api.post('/api/bookmarks/')
      .send(helper.testBookmarks[0])

    // modify the token so that it is incorrect
    token[0] = 'x'
    token[2] = 'x'

    // unauthenticated user cannot delete bookmark
    const notCorrectUser = await api.delete(`/api/bookmarks/${response.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(notCorrectUser.status !== 200)
  })

  test('Authenticated user can delete their own bookmark', async () => {
    // post a legitimate bookmark
    const response = await api.post('/api/bookmarks/')
      .send(helper.testBookmarks[0])

    // authenticated user can delete bookmark
    const correctUser = await api.delete(`/api/bookmarks/${response.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(correctUser.status === 204)
  })
})

describe("Editing a bookmark", () => {
  test('Unauthenticated users cannot edit bookmark', async () => {
    // post a legitimate bookmark
    const response = await api.post('/api/bookmarks/')
      .send(helper.testBookmarks[0])

    // modify the token so that it is incorrect
    token[0] = 'x'
    token[2] = 'x'

    const modifications = {
      name: 'modifiedName'
    }

    // unauthenticated user cannot modify bookmark
    const notCorrectUser = await api.put(`/api/bookmarks/${response.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(modifications)

    expect(notCorrectUser.status !== 200)
  })

  test('Authenticated user can modify name', async () => {
    // post a legitimate bookmark
    const response = await api.post('/api/bookmarks/')
      .send(helper.testBookmarks[0])

    const modifications = {
      name: 'modifiedName'
    }

    // authenticated user cannot modify bookmark
    const modifiedBookmark = await api.put(`/api/bookmarks/${response.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(modifications)

    expect(modifiedBookmark.body.name === modifications.name)
  })

  test('Authenticated user can modify url', async () => {
    // post a legitimate bookmark
    const response = await api.post('/api/bookmarks/')
      .send(helper.testBookmarks[0])

    const modifications = {
      url: 'http://www.modified_url.com'
    }

    // authenticated user cannot modify bookmark
    const modifiedBookmark = await api.put(`/api/bookmarks/${response.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(modifications)

    expect(modifiedBookmark.body.url === modifications.url)
  })

  test('Authenticated user can modify category', async () => {
    // post a legitimate bookmark
    const response = await api.post('/api/bookmarks/')
      .send(helper.testBookmarks[0])

    const modifications = {
      category: 'modifiedCategory'
    }

    // authenticated user cannot modify bookmark
    const modifiedBookmark = await api.put(`/api/bookmarks/${response.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(modifications)

    expect(modifiedBookmark.body.category === modifications.category)
  })

  test('Authenticated user can modify notes', async () => {
    // post a legitimate bookmark
    const response = await api.post('/api/bookmarks/')
      .send(helper.testBookmarks[0])

    const modifications = {
      notes: 'modifiedNotes'
    }

    // authenticated user cannot modify bookmark
    const modifiedBookmark = await api.put(`/api/bookmarks/${response.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(modifications)

    expect(modifiedBookmark.body.notes === modifications.notes)
  })

  test('Authenticated user can modify all bookmark fields', async () => {
    // post a legitimate bookmark
    const response = await api.post('/api/bookmarks/')
      .send(helper.testBookmarks[0])

    // authenticated user cannot modify bookmark
    const modifiedBookmark = await api.put(`/api/bookmarks/${response.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(helper.testBookmarks[1])

    expect(modifiedBookmark.body.name === helper.testBookmarks.name)
    expect(modifiedBookmark.body.url === helper.testBookmarks.url)
    expect(modifiedBookmark.body.category === helper.testBookmarks.category)
    expect(modifiedBookmark.body.notes === helper.testBookmarks.notes)
  })
})

// close DB connection
afterAll(() => {
  mongoose.connection.close()
})