const errorHandler = (error, request, response, next) => {

  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'CastError') {
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error collection')) {
    return response.status(400).send({ error: '`username` is already taken' })
  }

  console.log(error.message)

  next(error)
}

module.exports = {
  errorHandler
}