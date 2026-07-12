'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/requests.controller');
const { requireAuth } = require('../util/authMiddleware');

// Page route — show my requests
router.get('/', requireAuth, controller.getRequestsPage);

// Approve/Reject
router.post('/:id/approve', requireAuth, controller.approveRequest);
router.post('/:id/reject',  requireAuth, controller.rejectRequest);

// API — delete
router.delete('/:id', controller.deleteRequest);

module.exports = router;
