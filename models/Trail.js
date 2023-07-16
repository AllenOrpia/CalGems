
const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema

const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    //--Virtual to replace the url so that cloudinary can return a cropped version of the image
    return this.url.replace('/upload', '/upload/w_200,ar_1')
})



//--opts to allow virtuals to be passed in 
const opts = { toJSON: { virtuals: true } }
const trailSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Beach name cannot be blank..']
    },
    //images as an array to allow for multiple image uploads
    images: [imageSchema],
    description: {
        type: String,
        required: [true, 'Please give a description..']
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    //For geoson data and mapbox api
    geometry: {
        type: {
            type: String,
            enum: ['Point'], //location.type must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]

}, opts)


trailSchema.virtual('properties.clusterPopup').get(function () {
    return `<a href="trails/${this._id}" class="text-primary font-semibold h6">${this.title}</a>`
})



//this is to make sure that all reviews are deleted when the campground in which the reviews were made is deleted
trailSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } })
    }
})

module.exports = mongoose.model('Trail', trailSchema)
