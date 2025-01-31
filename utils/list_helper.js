const _ = require('lodash')

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item
  }
  return blogs.map(blog => blog.likes).reduce(reducer, 0)

}

const favouriteBlog = (blogs) => {
  let blogWithMaxLikes = blogs[0]

  blogs.forEach(blog => {
    if (blogWithMaxLikes.likes < blog.likes) {
      blogWithMaxLikes = blog
    }
  })

  return {
    title: blogWithMaxLikes.title,
    author: blogWithMaxLikes.author,
    likes: blogWithMaxLikes.likes
  }
}

const mostBlogs = (blogs) => {
  const authorCounts = _.countBy(blogs, 'author')
  const authorWithMostBlogs = _.maxBy(Object.keys(authorCounts), (author) => authorCounts[author])

  return {
    author: authorWithMostBlogs,
    blogs: authorCounts[authorWithMostBlogs]
  }
}

const mostLikes = (blogs) => {
  const blogsGroupedByAuthor = _.groupBy(blogs, 'author')
  const likeCounts = _.mapValues(blogsGroupedByAuthor, (blogs) => _.sumBy(blogs, 'likes'))
  const authorWithMostLikes = _.maxBy(Object.keys(likeCounts), (author) => likeCounts[author])

  return {
    author: authorWithMostLikes,
    likes: likeCounts[authorWithMostLikes]
  }
}

module.exports = { dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes }