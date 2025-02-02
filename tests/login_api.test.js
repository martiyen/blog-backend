const { beforeEach, describe, test, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('abc123', 10)

  const user = new User({
    username: 'jdoe',
    name: 'John Doe',
    passwordHash: passwordHash
  })

  await user.save()
})

describe('login', () => {

  test('succeeds with valid credentials with status code 200 and returns token', async () => {
    const credentials = {
      username : 'jdoe',
      password: 'abc123'
    }

    const response = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(response.body.token)
  })

  test('fails when invalid credentials with status code 401', async () => {
    const credentials = {
      username : 'jdoe',
      password: 'abc456'
    }

    const response = await api
      .post('/api/login')
      .send(credentials)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert(response.body.error.includes('invalid username or password'))
  })
})

after(async () => {
  await mongoose.connection.close()
})