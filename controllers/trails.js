
const Trail = require('../models/Trail')
const { cloudinary } = require('../cloudinary')
const mboxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mboxToken = process.env.MAPBOX_TOKEN
const geoCoder = mboxGeocoding({ accessToken: mboxToken })


module.exports.index = async (req, res) => {
    const trails = await Trail.find({})

    res.render('trails/allTrails', { trails })
}

module.exports.newTrailForm = (req, res) => {
    res.render('trails/new')
}


module.exports.createNewTrail = (async (req, res) => {
    const geoRes = await geoCoder.forwardGeocode({
        query: req.body.trail.location,
        limit: 1
    }).send()

    const trail = new Trail(req.body.trail)
    trail.geometry = geoRes.body.features[0].geometry
    trail.images = req.files.map(file => ({ url: file.path, filename: file.filename }))
    trail.author = req.user._id
    await trail.save()
    req.flash('success', 'New Trail made!')
    res.redirect(`/trails/${trail._id}`)
})

module.exports.showOneTrail = async (req, res) => {
    const { id } = req.params
    const trail = await Trail.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')

    if (!trail) {
        req.flash('error', 'No trail found')
        return res.redirect('/trails')
    }
    res.render('trails/show', { trail })
}




module.exports.updateForm = async (req, res) => {
    const { id } = req.params
    const trail = await Trail.findById(id)

    if (!trail) {
        req.flash('error', 'No trail found')
        return res.redirect('/trails')
    }

    res.render('trails/update', { trail, id })
}

module.exports.update = async (req, res) => {
    const geoRes = await geoCoder.forwardGeocode({
        query: req.body.trail.location,
        limit: 1
    }).send()
    const { id } = req.params
    console.log(req.body)
    const trail = await Trail.findByIdAndUpdate(id, { ...req.body.trail })
    trail.geometry = geoRes.body.features[0].geometry
    const imgs = req.files.map(file => ({ url: file.path, filename: file.filename }))
    trail.images.push(...imgs)
    await trail.save()
    if (req.body.deleteImgs) {
        for (let filename of req.body.deleteImgs) {
            await cloudinary.uploader.destroy(filename)
        }
        //pull out of the images array the image where its filename is in the deleteImgs array
        await trail.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImgs } } } })
    }
    req.flash('success', 'successfully updated trail')
    res.redirect(`/trails/${trail._id}`)



}

module.exports.deleteTrail = async (req, res) => {
    const { id } = req.params
    const trail = await Trail.findById(id)
    if (!trail.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission')
        return res.redirect(`/trails/${id}`)
    }
    await Trail.findByIdAndDelete(id)
    req.flash('success', 'Trail successfully deleted')
    return res.redirect('/trails')
}