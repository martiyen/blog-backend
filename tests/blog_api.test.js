const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let newBlog = new Blog(blog)
    await newBlog.save()
  }
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blog identifier property is id', async () => {
  const blogs = await helper.blogsInDb()
  const keys = Object.keys(blogs[0])

  assert(keys.includes('id'))
})

test('create a new post when valid', async () => {
  const newBlog = {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await helper.blogsInDb()

  assert.strictEqual(response.length, helper.initialBlogs.length + 1)

  const titles = response.map(blog => blog.title)

  assert(titles.includes('First class tests'))
})

test('create a new post with 0 likes if not specified', async () => {
  const newBlog = {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll'
  }

  const addedBlog = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(addedBlog.body.likes, 0)
})

test.only('blog without title is not added', async () => {
  const newBlog = {
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAfter = await helper.blogsInDb()

  assert.strictEqual(blogsAfter.length, helper.initialBlogs.length)
})

test.only('blog without url is not added', async () => {
  const newBlog = {
    title: 'First class tests',
    author: 'Robert C. Martin'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAfter = await helper.blogsInDb()

  assert.strictEqual(blogsAfter.length, helper.initialBlogs.length)
})

after(async () => {
  await mongoose.connection.close()
})