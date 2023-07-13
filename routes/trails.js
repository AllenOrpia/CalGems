
const express = require('express')
const router = express.Router({ mergeParams: true })
//--multer middleware to handle multipart/form-data, primarily used for uploading files
const multer = require('multer')
const { storage } = require('../cloudinary/index');
const upload = multer({ storage });


const asyncWrapper = require('../util/asyncWrapper')

const trails = require('../controllers/trails')
const isLoggedIn = require('../middleware/isLoggedIn')
const { trailSchema } = require('../util/validationSchema')
const AppError = require('../util/AppError')


const Trail = require('../models/Trail')

const isOwner = async (req, res, next) => {
    const { id } = req.params
    const trail = await Trail.findById(id)
    if (!trail.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission')
        return res.redirect(`/trails/${id}`)
    }
    next()
}

const validateTrail = (req, res, next) => {

    const { error } = trailSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    }
    else {
        next()
    }
}




router.route('/')
    .get(asyncWrapper(trails.index))
    .post(isLoggedIn, upload.array('image'), validateTrail, asyncWrapper(trails.createNewTrail))


router.get('/new', isLoggedIn, trails.newTrailForm)

router.route('/:id')
    .get(asyncWrapper(trails.showOneTrail))
    .put(isLoggedIn, isOwner, upload.array('image'), validateTrail, asyncWrapper(trails.update))
    .delete(isLoggedIn, isOwner, trails.deleteTrail)


router.get('/:id/edit', isLoggedIn, isOwner, asyncWrapper(trails.updateForm))

// router.route('/:id/review')
//     .get(asyncWrapper(trails.newReview)) 
//     .post(isLoggedIn, asyncWrapper(trails.createNewReview))

module.exports = router