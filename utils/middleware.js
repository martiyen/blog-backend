const jwt = require('jsonwebtoken')
const User = require('../models/user')

const errorHandler = (error, request, response, next) => {

  console.log(error.message)

  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'CastError') {
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error collection')) {
    return response.status(400).send({ error: '`username` is already taken' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).send({ error: error.message })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  let token = null
  const authorization = request.get('authorization')

  if (authorization && authorization.startsWith('Bearer ')) {
    token = authorization.replace('Bearer ', '')
  }

  request.token = token

  next()
}

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).send({ error: 'token invalid' })
  }

  request.user = await User.findById(decodedToken.id)

  next()
}

module.exports = {
  errorHandler,
  tokenExtractor,
  userExtractor
}