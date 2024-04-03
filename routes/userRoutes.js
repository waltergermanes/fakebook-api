const { updateUser, getUser, followUser, unFollowUser, getSuggestionUsers, getUserFollowing, getUserFollowers, getUserSearch } = require("../controllers/userController")
const express = require("express")
const app = express()
const router = require("express").Router()

router.get("/", getUser)
      .get("/followsuggestion/:id", getSuggestionUsers)
      .get("/following/:id", getUserFollowing)
      .get("/search", getUserSearch)
      .get("/followers/:id", getUserFollowers)
      .put("/:id", updateUser)
      .put("/follow/:id", followUser)
      .put("/unfollow/:id", unFollowUser)

module.exports = router