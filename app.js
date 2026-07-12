// app.js
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(
  session({
    secret: 'roomies_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 4  // 4 hours
    }
  })
);

// View Engine - EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static from /public - CSS, client JS, Images
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const pagesRoutes = require('./routes/pages.routes');
const authRoutes = require('./routes/auth.routes');
const listingRoutes = require('./routes/listings.routes');
const newListingRoutes = require('./routes/newListing.routes');
const requestRoutes = require('./routes/requests.routes');
app.use('/auth', authRoutes);
app.use('/listings', listingRoutes);
app.use('/new-listing', newListingRoutes);
app.use('/requests', requestRoutes);

// Pages last
app.use('/', pagesRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('pages/error', {
    pageTitle: 'העמוד לא נמצא',
    user: req.session.username ? { username: req.session.username } : null
  });
});

// Server
app.listen(3000, () => {
  console.log('Roomies server running on http://localhost:3000');
});

module.exports = app;
