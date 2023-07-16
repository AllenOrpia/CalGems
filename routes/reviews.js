const express = require('express')
//The mergeParams allow us to merge the params of the default params in the index when using our review routes
const router = express.Router({ mergeParams: true })
const Trail = require('../models/Trail')
const AppError = require('../util/AppError')
const { reviewSchema } = require('../util/validationSchema.js')
const isLoggedIn = require('../middleware/isLoggedIn')
const reviews = require('../controllers/reviews')
const Review = require('../models/Review')
const asyncWrapper = require('../util/asyncWrapper')



const validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    }
    else {
        next()
    }
}

const isReviewer = async (req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission')
        return res.redirect(`/trails/${id}`)
    }
    next()
}

router.get('/', isLoggedIn, asyncWrapper(reviews.ReviewForm))
router.post('/', isLoggedIn, validateReview, asyncWrapper(reviews.createReview))

router.route('/:reviewId')
    .get(isLoggedIn, isReviewer, asyncWrapper(reviews.updateForm))
    .delete(isLoggedIn, isReviewer, asyncWrapper(reviews.deleteReview))
    .put(isLoggedIn, isReviewer, asyncWrapper(reviews.updateReview))

module.exports = router