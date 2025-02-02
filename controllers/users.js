const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')
const user = require('../models/user')

userRouter.get('/', async (request, response) => {
  const users = await user.find({}).populate('blogs', { title: 1, author: 1, url: 1 })
  response.json(users)
})

userRouter.post('/', async (request, response) => {
  const body = request.body

  if (!body.password || body.password.length < 3) {
    return response.status(400).json({ error: 'password must be at least 3 characters long' })
  }

  const passwordHash = await bcrypt.hash(body.password, 10)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash: passwordHash
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = userRouter