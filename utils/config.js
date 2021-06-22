require('dotenv').config()

const PORT = process.env.PORT
const MONGO_CONNECTION_URL = process.env.MONGO_CONNECTION_URL
const JWT_SECRET = process.env.JWT_SECRET

module.exports = {
  MONGO_CONNECTION_URL,
  PORT,
  JWT_SECRET
}