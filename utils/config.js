require('dotenv').config()

const PORT = process.env.PORT
const MONGO_CONNECTION_URL = process.env.MONGO_CONNECTION_URL

module.exports = {
  MONGO_CONNECTION_URL,
  PORT
}