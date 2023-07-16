
const Review = require('../models/Review')
const Trail = require('../models/Trail')


module.exports.ReviewForm = async (req, res) => {
    const { id } = req.params
    const trail = await Trail.findById(id)
    res.render('reviews/new', { trail })
}

module.exports.updateForm = async (req, res) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    const trail = await Trail.findById(id)

    res.render('reviews/update', {trail, review})
}

module.exports.createReview = async (req, res) => {
    const review = new Review(req.body.review)
    const trail = await Trail.findById(req.params.id)
    review.author = req.user._id
    trail.reviews.push(review)
    await review.save()
    await trail.save()
    req.flash('succes', 'New review created successfully')
    res.redirect(`/trails/${trail._id}`)
}

module.exports.updateReview = async (req, res) => {
    const { id, reviewId } = req.params
    const review = await Review.findByIdAndUpdate(reviewId, { ...req.body.review })
    await review.save()
    req.flash('success', 'Review updated')
    res.redirect(`/trails/${id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params
    await Trail.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Review has been deleted')
    res.redirect(`/trails/${id}`)
}