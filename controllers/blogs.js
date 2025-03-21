const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body

  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id.toString()
  })

  const savedBlog = await blog.save()
  savedBlog.populate('user', { username: 1, name: 1 })
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const blogId = request.params.id

  const user = request.user
  const blog = await Blog.findById(blogId)

  if (user._id.toString() !== blog.user.toString()) {
    return response.status(401).send({ error: 'not authorized to delete blogs added by someone else' })
  }

  await Blog.findByIdAndDelete(blogId)
  user.blogs = user.blogs.filter(id => id.toString() !== blogId)
  await user.save()

  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog =
    {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
    }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true }).populate('user', { username: 1, name: 1 })
  updatedBlog
    ? response.json(updatedBlog)
    : response.status(404).send({ error: 'not found' })
})

module.exports = blogsRouter