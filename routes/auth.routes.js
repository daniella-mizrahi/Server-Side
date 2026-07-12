'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/auth.controller');

// Auth pages
router.get('/login',      controller.getLogin);
router.post('/login',     controller.postLogin);
router.get('/register',   controller.getRegister);
router.post('/register',  controller.postRegister);
router.post('/logout',    controller.postLogout);

// API (for CRUD completeness)
router.put('/profile',    controller.updateProfile);
router.delete('/profile', controller.deleteProfile);

module.exports = router;
