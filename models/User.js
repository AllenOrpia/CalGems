
const mongoose = require('mongoose')
const Schema = mongoose.Schema

//--Mongoose plugin that simplifies building a username and password login with passport
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new Schema({
    email: {
        type: String, 
        require: true,
        unique: true
    }
})

//The passportLocalMongoose plugin will add in a username, password field and make sure
//They are all unique which is why email is the only thing specified in the Schema
userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)