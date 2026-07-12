'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/listings.controller');
const { requireAuth } = require('../util/authMiddleware');

// Mounted at /new-listing
router.get('/',  requireAuth, controller.getNewListingForm);
router.post('/', requireAuth, controller.postNewListing);

module.exports = router;
