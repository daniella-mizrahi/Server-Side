'use strict';

const listingModel = require('../models/listing.model');
const requestModel = require('../models/request.model');

/**
 * CONTROLLER: listings.controller.js
 * Renders listing pages with EJS + handles form POST.
 */

// GET /listings — show all listings
exports.getListings = async (req, res) => {
  try {
    const listings = await listingModel.getAllActive();
    return res.render('listings/listings', {
      pageTitle: 'לוח דירות',
      listings,
      user: req.session.username ? { username: req.session.username } : null
    });
  } catch (err) {
    console.error('[listings – getListings]', err.message);
    return res.status(500).render('pages/error', {
      pageTitle: 'שגיאת שרת',
      user: req.session.username ? { username: req.session.username } : null
    });
  }
};

// GET /listings/:id — show single listing detail + its requests
exports.getListingById = async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);
    if (isNaN(listingId)) {
      return res.status(400).render('pages/error', {
        pageTitle: 'מזהה דירה לא תקין',
        user: req.session.username ? { username: req.session.username } : null
      });
    }

    const listing = await listingModel.findById(listingId);
    if (!listing) {
      return res.status(404).render('pages/error', {
        pageTitle: 'הדירה לא נמצאה',
        user: req.session.username ? { username: req.session.username } : null
      });
    }

    const requests = await requestModel.getByListingId(listingId);

    return res.render('listings/listingDetail', {
      pageTitle: listing.city + ' — ' + listing.address,
      listing,
      requests,
      user: req.session.username ? { username: req.session.username } : null
    });
  } catch (err) {
    console.error('[listings – getListingById]', err.message);
    return res.status(500).render('pages/error', {
      pageTitle: 'שגיאת שרת',
      user: req.session.username ? { username: req.session.username } : null
    });
  }
};

// GET /new-listing — show form
exports.getNewListingForm = (req, res) => {
  res.render('listings/newListing', {
    pageTitle: 'פרסום דירה חדשה',
    formError: null,
    successMsg: null,
    values: {},
    user: req.session.username ? { username: req.session.username } : null
  });
};

// POST /new-listing — handle form submission
exports.postNewListing = async (req, res) => {
  try {
    const { city, address, total_rent, room_count, available_from, description, roommate_gender_pref, pet_friendly } = req.body;

    if (!city || !address || !total_rent || !room_count || !available_from || !description) {
      return res.status(400).render('listings/newListing', {
        pageTitle: 'פרסום דירה חדשה',
        formError: 'כל שדות החובה חייבים להיות מלאים',
        successMsg: null,
        values: req.body,
        user: req.session.username ? { username: req.session.username } : null
      });
    }

    if (isNaN(total_rent) || total_rent <= 0 || total_rent > 20000) {
      return res.status(400).render('listings/newListing', {
        pageTitle: 'פרסום דירה חדשה',
        formError: 'מחיר שכירות לא תקין (1-20,000)',
        successMsg: null,
        values: req.body,
        user: req.session.username ? { username: req.session.username } : null
      });
    }

    const today = new Date().toISOString().split('T')[0];
    if (available_from < today) {
      return res.status(400).render('listings/newListing', {
        pageTitle: 'פרסום דירה חדשה',
        formError: 'תאריך כניסה חייב להיות בעתיד',
        successMsg: null,
        values: req.body,
        user: req.session.username ? { username: req.session.username } : null
      });
    }

    await listingModel.insertListing({
      posted_by_username: req.session.username,
      city, address, total_rent, room_count, available_from, description,
      roommate_gender_pref: roommate_gender_pref || 'any',
      pet_friendly: pet_friendly ? true : false
    });

    return res.render('listings/newListing', {
      pageTitle: 'פרסום דירה חדשה',
      formError: null,
      successMsg: 'הדירה פורסמה בהצלחה! 🏠',
      values: {},
      user: req.session.username ? { username: req.session.username } : null
    });
  } catch (err) {
    console.error('[listings – postNewListing]', err.message);
    return res.status(500).render('listings/newListing', {
      pageTitle: 'פרסום דירה חדשה',
      formError: 'שגיאת שרת בעת פרסום הדירה',
      successMsg: null,
      values: req.body,
      user: req.session.username ? { username: req.session.username } : null
    });
  }
};

// API endpoints (PUT/DELETE kept for CRUD completeness)
exports.updateListing = async (req, res) => {
  try {
    if (!req.session || !req.session.username) {
      return res.status(401).json({ success: false, message: 'יש להתחבר' });
    }
    const listingId = parseInt(req.params.id);
    if (isNaN(listingId)) return res.status(400).json({ success: false, message: 'מזהה לא תקין' });
    const existing = await listingModel.findById(listingId);
    if (!existing) return res.status(404).json({ success: false, message: 'לא נמצאה' });
    const { city, address, total_rent, room_count, available_from, description, roommate_gender_pref, pet_friendly } = req.body;
    await listingModel.updateListing(listingId, { city, address, total_rent, room_count, available_from, description, roommate_gender_pref: roommate_gender_pref || 'any', pet_friendly: pet_friendly || false });
    return res.status(200).json({ success: true, message: 'עודכנה בהצלחה' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'שגיאת שרת' });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    if (!req.session || !req.session.username) return res.status(401).json({ success: false, message: 'יש להתחבר' });
    const listingId = parseInt(req.params.id);
    if (isNaN(listingId)) return res.status(400).json({ success: false, message: 'מזהה לא תקין' });
    const existing = await listingModel.findById(listingId);
    if (!existing) return res.status(404).json({ success: false, message: 'לא נמצאה' });
    await listingModel.deleteListing(listingId);
    return res.status(200).json({ success: true, message: 'נמחקה בהצלחה' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'שגיאת שרת' });
  }
};
