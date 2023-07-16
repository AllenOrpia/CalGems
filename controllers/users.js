
const User = require('../models/User')

module.exports.registerForm = async (req, res) => {
    res.render('users/register')
}

module.exports.registerNewUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username})
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) {
                return next(err)
            }
            req.flash('success', 'Welcome you were successfully registered!')
            res.redirect('/trails')
        })

    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}


module.exports.loginForm = async (req, res) => {
    res.render('users/login')
}

module.exports.loginUser = async(req,res) => {
    req.flash('success', 'Welcome Back!')
    const redirectToUrl = res.locals.returnTo || '/trails'
    res.redirect(redirectToUrl)
}

module.exports.logoutUser = (req, res, next) => {
    req.logOut(function (err) {
        if (err) {
            return next(err)
        }
        req.flash('success', 'Succesfully Logged Out')
        res.redirect('/trails')
    })
}