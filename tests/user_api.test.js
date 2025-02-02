const { beforeEach, test, after, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

describe('when there is one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('abc123', 10)

    const user = new User({
      username: 'mdoyen',
      name: 'Martin Doyen',
      passwordHash: passwordHash
    })

    await user.save()
  })

  test('finds 1 user in db with status code 200', async () => {
    const users = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(users.body.length, 1)
    assert(users.body.map(u => u.username).includes('mdoyen'))
  })

  describe('when adding a new user', () => {

    test('succeeds when valid', async () => {
      const usersAtStart = await helper.usersInDb()

      const user = {
        username: 'jdoe',
        name: 'John Doe',
        password: '123456'
      }

      await api
        .post('/api/users')
        .send(user)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)

      assert(usernames.includes(user.username))
    })

    test('fails when non unique username with status code 400', async () => {
      const usersAtStart = await helper.usersInDb()

      const user = {
        username: 'mdoyen',
        name: 'Martin Doyen',
        password: 'abc123'
      }

      const response = await api
        .post('/api/users')
        .send(user)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)

      const errorMessage = response.body.error

      assert(errorMessage.includes('`username` is already taken'))
    })

    test('fails when password not valid with status code 400', async () => {
      const usersAtStart = await helper.usersInDb()

      const user = {
        username: 'mdoyen',
        name: 'Martin Doyen',
        password: 'aa'
      }

      const response = await api
        .post('/api/users')
        .send(user)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)

      const errorMessage = response.body.error

      assert(errorMessage.includes('password must be at least 3 characters long'))
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
