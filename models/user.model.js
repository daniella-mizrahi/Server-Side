'use strict';

const pool = require('../util/database');

/**
 * MODEL: user.model.js
 * Responsibility: Raw SQL queries for the `users` table ONLY.
 */

async function findByUsername(username) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE username = ? LIMIT 1',
    [username]
  );
  return rows[0] || null;
}

async function findById(userId) {
  const [rows] = await pool.execute(
    'SELECT user_id, username, city_preference, budget_range, lifestyle_type, pet_policy, smoking_policy, roommate_gender_pref, created_at FROM users WHERE user_id = ? LIMIT 1',
    [userId]
  );
  return rows[0] || null;
}

async function createUser(userData) {
  const {
    username, password_hash,
    city_preference, budget_range, lifestyle_type,
    pet_policy, smoking_policy, roommate_gender_pref
  } = userData;

  const [result] = await pool.execute(
    `INSERT INTO users
      (username, password_hash, city_preference, budget_range, lifestyle_type, pet_policy, smoking_policy, roommate_gender_pref)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [username, password_hash, city_preference, budget_range, lifestyle_type, pet_policy, smoking_policy, roommate_gender_pref]
  );
  return result.insertId;
}

async function updateUser(userId, fields) {
  const { city_preference, budget_range, lifestyle_type, pet_policy, smoking_policy, roommate_gender_pref } = fields;
  await pool.execute(
    `UPDATE users
     SET city_preference = ?, budget_range = ?, lifestyle_type = ?, pet_policy = ?, smoking_policy = ?, roommate_gender_pref = ?
     WHERE user_id = ?`,
    [city_preference, budget_range, lifestyle_type, pet_policy, smoking_policy, roommate_gender_pref, userId]
  );
}

async function deleteUser(userId) {
  await pool.execute('DELETE FROM users WHERE user_id = ?', [userId]);
}

module.exports = { findByUsername, findById, createUser, updateUser, deleteUser };
