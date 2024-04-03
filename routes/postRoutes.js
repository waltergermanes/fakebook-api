const { getfriendsPosts, getPost, createPost, editPost, likePost, deletePost, getUserPosts, addPostcomment, getPostcomment, getFriendStories, getLikePosts, getCommentPosts } = require('../controllers/postsController')

const router = require('express').Router()


router.get('/timeline/:id', getfriendsPosts)
      .get('/likes/:id', getLikePosts)
      .get('/comments/:id', getCommentPosts)
      .get('/profile/:id', getUserPosts)
      .get('/:id', getPost)
      .post('/', createPost)
      .put('/:id', editPost)
      .put('/:id/like', likePost)
      .delete('/:id', deletePost)
      .post('/:id', addPostcomment)
      .get('/comment/:id', getPostcomment)

module.exports = router