const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');


// the main express instance; handles routing
const app = express();
// let app act as a body parser
app.use(express.urlencoded({ extended: true }))


// set up the database
const Database = require('./contactDB');
const db = new Database();
db.initialize();

// attach the database to the request before it reaches the routes
app.use((req, res, next) => {
    req.db = db;
    next(); // ensures this updated version reaches the route
});

app.use(session({
    secret: 'cmps369',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

// add the session data to each request before it reaches the routes
app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = {
            id: req.session.user.id,
            username: req.session.user.username,
            firstName: req.session.user.firstName,
            lastName: req.session.user.lastName
        }
    }
    next()
})

// let app use the views directory to generate pages
app.set('view engine', 'pug');

// set up the static public route; this is needed for the css to work
app.use(express.static('public'));

// connect the route files
app.use('/', require('./routes/accounts'))
app.use('/create', require('./routes/create'));
app.use('/places', require('./routes/places'));

app.use('/', require('./routes/contacts'));

app.listen(8080, () => {
    console.log(`Example app listening on port 8080`)
})