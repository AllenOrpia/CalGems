if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}



const express = require('express');
const app = express();
const path = require('path');
//Method override to use patch and delete since forms only allows us to do get and post requests
const methodOverride = require('method-override');
const ejsEngine = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo')
const flash = require('connect-flash');
//---Passport will be used to authenticate requests, it is a middleware
const passport = require('passport');
//--Passport strategy for authenticating with a username and password
const passportLocal = require('passport-local');
const User = require('./models/User');

const trailRoutes = require('./routes/trails');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');



const dbUrl = proccess.env.DBATLAS_URL || 'mongodb://127.0.0.1:27017/CalGems'
//------Mongoose Connection
const mongoose = require('mongoose');
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Connected to Database!')
});


app.engine('ejs', ejsEngine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//--express.urlencoded allows set to true to parse out the req.body and lets us get the inputs of forms to use
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    'https://code.jquery.com/'
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/"

];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dy9gaz8bh/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
); 

const secret = process.env.SECRET || 'thissecretsucks!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
     /*touchAfter
            lazy session update - If you don't want to resave all the session on db every time that the user refresh the page, you 
            can lazy update the session, by limiting a period of time. This is basically to avoid unnecessary updates on session
        */
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});


store.on('error', function (e) {
    console.log('session store error')
});

const sessionConfig = {
    store,
    //name of the cookie or session id
    name: 'cgsession',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        //This makes the cookies accessible through http only and not through JS
        httpOnly: true,
        //The secure is not for development but should definitely be used when deploying
        // secure: true,
        //This puts an expiration date usually a week from when it is made, 1000 milisescconds in a second
        //60 seconds in 1 min, 60 mins in 1 hr, 24 hrs, 7 days
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());;
app.use(mongoSanitize());

app.use((req, res, next) => {

    res.locals.currentUser = req.user
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


app.use('/', userRoutes);
app.use('/trails', trailRoutes);
app.use('/trails/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('index')
});

app.use((err, req, res, next) => {
    const { status = 500 } = err

    if (!err.message) {
        err.message = 'Something went wrong oh no!'
    }
    res.status(status).render('error', { status, err })
});

app.listen(3000, () => {
    console.log('Live on port 3000!')
});