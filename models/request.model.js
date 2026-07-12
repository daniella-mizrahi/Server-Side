'use strict';

const pool = require('../util/database');

/**
 * MODEL: request.model.js
 * Responsibility: Raw SQL queries for the `roommate_requests` table ONLY.
 */

async function insertRequest(requestData) {
  const {
    applicant_username, listing_id_ref,
    message, move_in_date, monthly_budget,
    has_pets, is_smoker, occupation
  } = requestData;

  const [result] = await pool.execute(
    `INSERT INTO roommate_requests
      (applicant_username, listing_id_ref, message, move_in_date, monthly_budget, has_pets, is_smoker, occupation)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [applicant_username, listing_id_ref, message, move_in_date, monthly_budget, has_pets ? 1 : 0, is_smoker ? 1 : 0, occupation]
  );
  return result.insertId;
}

async function getByListingId(listingIdRef) {
  const [rows] = await pool.execute(
    'SELECT * FROM roommate_requests WHERE listing_id_ref = ? ORDER BY created_at DESC',
    [listingIdRef]
  );
  return rows;
}

async function getByApplicant(username) {
  const [rows] = await pool.execute(
    'SELECT * FROM roommate_requests WHERE applicant_username = ? ORDER BY created_at DESC',
    [username]
  );
  return rows;
}

async function findById(requestId) {
  const [rows] = await pool.execute(
    'SELECT * FROM roommate_requests WHERE request_id = ? LIMIT 1',
    [requestId]
  );
  return rows[0] || null;
}

async function updateStatus(requestId, status) {
  await pool.execute(
    'UPDATE roommate_requests SET status = ? WHERE request_id = ?',
    [status, requestId]
  );
}

async function deleteRequest(requestId) {
  await pool.execute('DELETE FROM roommate_requests WHERE request_id = ?', [requestId]);
}

module.exports = { insertRequest, getByListingId, getByApplicant, findById, updateStatus, deleteRequest };
