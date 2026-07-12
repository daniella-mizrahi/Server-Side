'use strict';

const requestModel = require('../models/request.model');
const listingModel = require('../models/listing.model');

/**
 * CONTROLLER: requests.controller.js
 * Handles roommate request CRUD.
 */

// GET /requests — show logged-in user's requests page
exports.getRequestsPage = async (req, res) => {
  try {
    const username = req.session.username;
    const myRequests = await requestModel.getByApplicant(username);

    // For each request, fetch the listing info (city + address)
    for (let r of myRequests) {
      const listing = await listingModel.findById(r.listing_id_ref);
      r.listing_city = listing ? listing.city : 'לא ידוע';
      r.listing_address = listing ? listing.address : '';
    }

    return res.render('requests/requests', {
      pageTitle: 'הבקשות שלי',
      requests: myRequests,
      user: { username },
      flash: req.query.flash || null
    });
  } catch (err) {
    console.error('[requests – getRequestsPage]', err.message);
    return res.status(500).render('pages/error', {
      pageTitle: 'שגיאת שרת',
      user: req.session.username ? { username: req.session.username } : null
    });
  }
};

// POST /listings/:listing_id/request — submit a roommate request (form POST from listing detail)
exports.postRequest = async (req, res) => {
  try {
    const listing_id_ref = parseInt(req.params.listing_id);
    const { message, move_in_date, monthly_budget, has_pets, is_smoker, occupation } = req.body;

    if (!message || !move_in_date || !monthly_budget || !occupation) {
      return res.redirect('/listings/' + listing_id_ref + '?flash=' + encodeURIComponent('כל שדות החובה חייבים להיות מלאים'));
    }

    await requestModel.insertRequest({
      applicant_username: req.session.username,
      listing_id_ref,
      message, move_in_date,
      monthly_budget: parseFloat(monthly_budget),
      has_pets: has_pets ? 1 : 0,
      is_smoker: is_smoker ? 1 : 0,
      occupation
    });

    return res.redirect('/listings/' + listing_id_ref + '?flash=' + encodeURIComponent('המועמדות נשלחה בהצלחה! 📩'));
  } catch (err) {
    console.error('[requests – postRequest]', err.message);
    return res.redirect('/listings/' + req.params.listing_id);
  }
};

// POST /requests/:id/approve
exports.approveRequest = async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const existing = await requestModel.findById(requestId);
    if (!existing) return res.status(404).render('pages/error', { pageTitle: 'הבקשה לא נמצאה', user: req.session.username ? { username: req.session.username } : null });
    await requestModel.updateStatus(requestId, 'approved');
    return res.redirect('/listings/' + existing.listing_id_ref);
  } catch (err) {
    console.error('[requests – approveRequest]', err.message);
    return res.status(500).render('pages/error', { pageTitle: 'שגיאת שרת', user: req.session.username ? { username: req.session.username } : null });
  }
};

// POST /requests/:id/reject
exports.rejectRequest = async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const existing = await requestModel.findById(requestId);
    if (!existing) return res.status(404).render('pages/error', { pageTitle: 'הבקשה לא נמצאה', user: req.session.username ? { username: req.session.username } : null });
    await requestModel.updateStatus(requestId, 'rejected');
    return res.redirect('/listings/' + existing.listing_id_ref);
  } catch (err) {
    console.error('[requests – rejectRequest]', err.message);
    return res.status(500).render('pages/error', { pageTitle: 'שגיאת שרת', user: req.session.username ? { username: req.session.username } : null });
  }
};

// DELETE /api/requests/:id (API)
exports.deleteRequest = async (req, res) => {
  try {
    if (!req.session || !req.session.username) return res.status(401).json({ success: false, message: 'יש להתחבר' });
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) return res.status(400).json({ success: false, message: 'מזהה לא תקין' });
    const existing = await requestModel.findById(requestId);
    if (!existing) return res.status(404).json({ success: false, message: 'לא נמצאה' });
    await requestModel.deleteRequest(requestId);
    return res.status(200).json({ success: true, message: 'נמחקה בהצלחה' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'שגיאת שרת' });
  }
};
