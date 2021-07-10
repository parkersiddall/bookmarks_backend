const app = require('../app')
const mongoose = require('mongoose')
const helper = require('./helper')
const supertest = require('supertest')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  // clear test database of users
  await User.deleteMany({})
})

describe('Creating an account', () => {
  test('Users get 200 after submitting form', async () => {
    const response = await api
      .post('/api/users')
      .send(helper.testUser)
  
    expect(response.status === 200)
  })

  test('Response contains correct information about created account', async () => {
    const response = await api
      .post('/api/users')
      .send(helper.testUser)

    expect(response.body.username === helper.testUser.username)
    expect(response.body.subreddit === 'earthporn')
    expect(response.body.prefersDark === false)
    expect(response.body.bookmarks).toHaveLength(0)
    expect(response.body.savedPhotos).toHaveLength(0)
  })

  test('DB contains correct number of users', async () => {
    // before registering new user
    const users = await User.find()
    expect(users.length === 0)

    // create new user
    const response = await api
      .post('/api/users')
      .send(helper.testUser)

    // after registering new user
    const newUsers = await User.find()
    expect(newUsers.length === 1)
  })
})

describe('Logging users in', () => {
  test('Login returns 200', async () => {
    // create new user
    const response = await api
      .post('/api/users')
      .send(helper.testUser)
  
    expect(response.status === 200)

    // log user in
    const loginResponse = await api
      .post('/api/login')
      .send(helper.testUser)

    expect(loginResponse.status === 200)
  })

  test('Login returns token and username', async () => {
    // create new user
    const response = await api
      .post('/api/users')
      .send(helper.testUser)
  
    expect(response.status === 200)

    // log user in
    const loginResponse = await api
      .post('/api/login')
      .send(helper.testUser)

    expect(loginResponse.body.username === helper.testUser.username)
    expect(loginResponse.body.token)
  })
})

describe('Changing user settings', () => {
  test('Modify a single setting', async () => {
    // create user
    const response = await api
      .post('/api/users')
      .send(helper.testUser)

    // get token
    const loginResponse = await api
      .post('/api/login')
      .send(helper.testUser)

    const token = loginResponse.body.token

    // change setting
    const newSettings = {
      prefersDark: true
    }

    // update via API
    const newResponse = await api
      .put('/api/users/settings')
      .send(newSettings)
      .set('Authorization', `Bearer ${token}`)

    expect(newResponse.body.prefersDark === true)
  })

  test('Modify multiple setting', async () => {
    // create user
    const response = await api
      .post('/api/users')
      .send(helper.testUser)

    // get token
    const loginResponse = await api
      .post('/api/login')
      .send(helper.testUser)

    const token = loginResponse.body.token

    // change setting
    const newSettings = {
      prefersDark: true,
      subreddit: 'cityporn'
    }

    // update via API
    const newResponse = await api
      .put('/api/users/settings')
      .send(newSettings)
      .set('Authorization', `Bearer ${token}`)

    expect(newResponse.body.prefersDark === true)
    expect(newResponse.body.prefersDark === 'cityporn')
  })
})

describe('Saving photos', () => {
  test('Photos get saved correctly', async () => {
    // create user
    const response = await api
      .post('/api/users')
      .send(helper.testUser)

    // get token
    const loginResponse = await api
      .post('/api/login')
      .send(helper.testUser)

    const token = loginResponse.body.token

    // save photo via API
    const newResponse = await api
      .put('/api/users/savedPhotos')
      .send(helper.testSavedPhoto)
      .set('Authorization', `Bearer ${token}`)

    expect(newResponse.body.savedPhotos.length === 1)
    expect(newResponse.body.savedPhotos[0].title === helper.testSavedPhoto.title)
  })

  test('Photos can be unsaved via the same API', async () => {
    // create user
    const response = await api
      .post('/api/users')
      .send(helper.testUser)
 
    // get token
    const loginResponse = await api
      .post('/api/login')
      .send(helper.testUser)

    const token = loginResponse.body.token

    // save photo via API
    const savedPhotoResponse = await api
      .put('/api/users/savedPhotos')
      .send(helper.testSavedPhoto)
      .set('Authorization', `Bearer ${token}`)

    expect(savedPhotoResponse.body.savedPhotos.length === 1)

    // unsave the photo via the same api
    const unsavedPhotoResponse = await api
      .put('/api/users/savedPhotos')
      .send(helper.testSavedPhoto)
      .set('Authorization', `Bearer ${token}`)

    expect(unsavedPhotoResponse.body.savedPhotos.length === 0)

  })
})

// close DB connection
afterAll(() => {
  mongoose.connection.close()
})