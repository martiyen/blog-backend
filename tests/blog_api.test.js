const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')

const Blog = require('../models/blog')

describe('when there are some blogs saved initially', () => {

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

  describe('creating a new blog', () => {

    test('succeeds when valid', async () => {
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

    test('succeeds when likes is undefined and sets it to 0', async () => {
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

    test('fails with status 400 when title is undefined', async () => {
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

    test('fails with status 400 when url is undefined', async () => {
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
  })

  describe('deleting a blog', () => {

    test('succeeds when valid', async () => {
      const initialBlogs = await helper.blogsInDb()
      const blogToDelete = initialBlogs[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const finalBlogs = await helper.blogsInDb()

      assert.strictEqual(finalBlogs.length, initialBlogs.length - 1)

      const finalBlogsIds = finalBlogs.map(blog => blog.id)

      assert(!finalBlogsIds.includes(blogToDelete.id))
    })

    test('fails with status 400 when id is invalid', async () => {
      const initialBlogs = await helper.blogsInDb()
      const invalidId = 123456

      await api
        .delete(`/api/blogs/${invalidId}`)
        .expect(400)

      const finalBlogs = await helper.blogsInDb()

      assert.strictEqual(finalBlogs.length, initialBlogs.length)
    })
  })

  describe('updating a blog', () => {

    test('succeeds when valid', async () => {
      const initialBlogs = await helper.blogsInDb()
      const blogToUpdate = initialBlogs[0]

      const blog = {
        title: blogToUpdate.title,
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: blogToUpdate.likes + 1
      }

      const updatedBlog = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(blog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(updatedBlog.body.likes, blog.likes)
      assert.notStrictEqual(updatedBlog.body.likes, blogToUpdate.likes)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})