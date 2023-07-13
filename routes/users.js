

const express = require('express')
const router = express.Router({ mergeParams: true })
const passport = require('passport')
const returnToUrl = require('../middleware/returnTo')
const asyncWrapper = require('../util/asyncWrapper')

const User = require('../models/User')
const users = require('../controllers/users')

router.route('/login')
    .get(users.loginForm)
    .post(returnToUrl, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser)


router.route('/register')
    .get(users.registerForm)
    .post(asyncWrapper(users.registerNewUser))

router.get('/logout', users.logoutUser)


module.exports = router