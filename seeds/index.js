

const Trail = require('../models/Trail')
const cities = require('./cities')
const { places, descriptors } = require('./seednames')

const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/CalGems', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Connected to Database!')
})


const sample = (array) => array[Math.floor(Math.random() * array.length)]
const seedData = async () => {
    await Trail.deleteMany({})
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const newTrail = new Trail({
            author:  "64a4ffdb034839d4f37cf2d9",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [{
                url: 'https://res.cloudinary.com/dy9gaz8bh/image/upload/v1688921569/CalGems/tpsqc54zgvfoxcyihovo.jpg',
                filename: 'CalGems/tpsqc54zgvfoxcyihovo',

            },
            {
                url: 'https://res.cloudinary.com/dy9gaz8bh/image/upload/v1688921497/CalGems/ccldujttmfezlstocm4p.jpg',
                filename: 'CalGems/ccldujttmfezlstocm4p',

            }],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorum repudiandae impedit ducimus voluptate ipsum recusandae officia sunt ab ea? Aliquid corrupti illo accusamus. Blanditiis quisquam facilis eos minus earum cupiditate.',
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            }

        })
        await newTrail.save()
    }
}

seedData().then(() => {
    mongoose.connection.close()
}) 