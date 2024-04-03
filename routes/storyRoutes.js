const { getFriendStories, getStory, getStoryById, saveStory } = require('../controllers/userStoriesController')
const router = require('express').Router()

router.get(`/:id`, getFriendStories)
      .get(`/story/:id`, getStory)
      .post(`/story`, saveStory)
      .get(`/storySingle/:id/:userId`, getStoryById)

module.exports = router