'use strict';

const bcrypt    = require('bcrypt');
const userModel = require('../models/user.model');

const SALT_ROUNDS = 10;

/**
 * CONTROLLER: auth.controller.js
 * Handles registration, login, logout with EJS views.
 */

// GET /auth/login
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    pageTitle: 'התחברות',
    formError: null,
    successMsg: null,
    email: '',
    user: req.session.username ? { username: req.session.username } : null
  });
};

// POST /auth/login
exports.postLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).render('auth/login', {
      pageTitle: 'התחברות',
      formError: 'שם משתמש וסיסמה הם חובה',
      successMsg: null,
      email: username || '',
      user: null
    });
  }

  try {
    const userRow = await userModel.findByUsername(username);
    if (!userRow) {
      return res.status(401).render('auth/login', {
        pageTitle: 'התחברות',
        formError: 'שם משתמש או סיסמה שגויים',
        successMsg: null,
        email: username,
        user: null
      });
    }

    const isMatch = await bcrypt.compare(password, userRow.password_hash);
    if (!isMatch) {
      return res.status(401).render('auth/login', {
        pageTitle: 'התחברות',
        formError: 'שם משתמש או סיסמה שגויים',
        successMsg: null,
        email: username,
        user: null
      });
    }

    req.session.userId   = userRow.user_id;
    req.session.username = userRow.username;

    return res.redirect('/');
  } catch (err) {
    console.error('[auth – postLogin]', err.message);
    return res.status(500).render('auth/login', {
      pageTitle: 'התחברות',
      formError: 'שגיאת שרת, נסי שנית',
      successMsg: null,
      email: username || '',
      user: null
    });
  }
};

// GET /auth/register
exports.getRegister = (req, res) => {
  res.render('auth/register', {
    pageTitle: 'הרשמה',
    formError: null,
    values: { username: '', city_preference: '' },
    user: req.session.username ? { username: req.session.username } : null
  });
};

// POST /auth/register
exports.postRegister = async (req, res) => {
  try {
    const {
      username, password,
      city_preference, budget_range, lifestyle_type,
      pet_policy, smoking_policy, roommate_gender_pref
    } = req.body;

    if (!username || !password || !city_preference || !budget_range ||
        !lifestyle_type || !pet_policy || !smoking_policy || !roommate_gender_pref) {
      return res.status(400).render('auth/register', {
        pageTitle: 'הרשמה',
        formError: 'כל השדות הם חובה',
        values: req.body,
        user: null
      });
    }

    const existing = await userModel.findByUsername(username);
    if (existing) {
      return res.status(409).render('auth/register', {
        pageTitle: 'הרשמה',
        formError: 'שם המשתמש כבר תפוס, אנא בחרי אחר',
        values: req.body,
        user: null
      });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const insertId = await userModel.createUser({
      username, password_hash,
      city_preference, budget_range, lifestyle_type,
      pet_policy, smoking_policy, roommate_gender_pref
    });

    req.session.userId   = insertId;
    req.session.username = username;

    return res.redirect('/');
  } catch (err) {
    console.error('[auth – postRegister]', err.message);
    return res.status(500).render('auth/register', {
      pageTitle: 'הרשמה',
      formError: 'שגיאת שרת, נסי שנית',
      values: req.body,
      user: null
    });
  }
};

// POST /auth/logout
exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};

// PUT /api/auth/profile (API — kept for completeness)
exports.updateProfile = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: 'יש להתחבר' });
    }
    const { city_preference, budget_range, lifestyle_type, pet_policy, smoking_policy, roommate_gender_pref } = req.body;
    if (!city_preference || !budget_range || !lifestyle_type || !pet_policy || !smoking_policy || !roommate_gender_pref) {
      return res.status(400).json({ success: false, message: 'כל השדות הם חובה' });
    }
    await userModel.updateUser(req.session.userId, {
      city_preference, budget_range, lifestyle_type, pet_policy, smoking_policy, roommate_gender_pref
    });
    return res.status(200).json({ success: true, message: 'הפרופיל עודכן בהצלחה' });
  } catch (err) {
    console.error('[auth – updateProfile]', err.message);
    return res.status(500).json({ success: false, message: 'שגיאת שרת' });
  }
};

// DELETE /api/auth/profile (API — kept for completeness)
exports.deleteProfile = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: 'יש להתחבר' });
    }
    await userModel.deleteUser(req.session.userId);
    req.session.destroy(() => {});
    return res.status(200).json({ success: true, message: 'החשבון נמחק בהצלחה' });
  } catch (err) {
    console.error('[auth – deleteProfile]', err.message);
    return res.status(500).json({ success: false, message: 'שגיאת שרת' });
  }
};
