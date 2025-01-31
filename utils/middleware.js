const errorHandler = (error, request, response, next) => {
  if (error.name === 'ValidationError') {
    return response.status(400).end()
  }

  next(error)
}

module.exports = {
  errorHandler
}