'use strict';

const pool = require('../util/database');

/**
 * MODEL: listing.model.js
 * Responsibility: Raw SQL queries for the `apartment_listings` table ONLY.
 */

async function getAllActive() {
  const [rows] = await pool.execute(
    'SELECT * FROM apartment_listings WHERE is_active = 1 ORDER BY created_at DESC'
  );
  return rows;
}

async function findById(listingId) {
  const [rows] = await pool.execute(
    'SELECT * FROM apartment_listings WHERE listing_id = ? LIMIT 1',
    [listingId]
  );
  return rows[0] || null;
}

async function insertListing(listingData) {
  const {
    posted_by_username, city, address, total_rent,
    room_count, available_from, description,
    roommate_gender_pref, pet_friendly
  } = listingData;

  const [result] = await pool.execute(
    `INSERT INTO apartment_listings
      (posted_by_username, city, address, total_rent, room_count, available_from, description, roommate_gender_pref, pet_friendly)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [posted_by_username, city, address, total_rent, room_count, available_from, description, roommate_gender_pref, pet_friendly ? 1 : 0]
  );
  return result.insertId;
}

async function updateListing(listingId, fields) {
  const { city, address, total_rent, room_count, available_from, description, roommate_gender_pref, pet_friendly } = fields;
  await pool.execute(
    `UPDATE apartment_listings
     SET city = ?, address = ?, total_rent = ?, room_count = ?, available_from = ?, description = ?, roommate_gender_pref = ?, pet_friendly = ?
     WHERE listing_id = ?`,
    [city, address, total_rent, room_count, available_from, description, roommate_gender_pref, pet_friendly ? 1 : 0, listingId]
  );
}

async function deleteListing(listingId) {
  await pool.execute('DELETE FROM apartment_listings WHERE listing_id = ?', [listingId]);
}

module.exports = { getAllActive, findById, insertListing, updateListing, deleteListing };
