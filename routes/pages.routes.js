// routes/pagesRoutes.js
const express = require('express');
const router  = express.Router();

// GET / — Home page
router.get('/', (req, res) => {
  res.render('index', {
    pageTitle: 'Roomies — מצאי שותפה לדירה',
    user: req.session.username ? { username: req.session.username } : null
  });
});

module.exports = router;
