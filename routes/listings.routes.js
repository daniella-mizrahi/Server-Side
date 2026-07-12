'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/listings.controller');
const requestsController = require('../controllers/requests.controller');
const { requireAuth } = require('../util/authMiddleware');

// Page routes
router.get('/',       controller.getListings);
router.get('/:id',    controller.getListingById);

// Submit roommate request from listing detail page
router.post('/:listing_id/request', requireAuth, requestsController.postRequest);

// API (CRUD)
router.put('/:id',    controller.updateListing);
router.delete('/:id', controller.deleteListing);

module.exports = router;
