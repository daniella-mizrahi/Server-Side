'use strict';

/**
 * new-listing.js — מסך 2: טופס פרסום דירה
 *
 * JS REQUIREMENT #1 IMPLEMENTATION:
 * "קליטת נתונים מהמשתמש וביצוע פעולה — חישוב בזמן אמת"
 * → updatePriceCalculator() is triggered by 'input' events on
 *   #total_rent and #room_count. It instantly updates <output>
 *   with the calculated price per person.
 *
 * JS VALIDATION REQUIREMENT:
 * "ולידציות מורכבות על לפחות 2 שדות"
 * → validateField() applies different rules per field:
 *   - total_rent:      must be a positive number, ≤ 20,000
 *   - available_from:  must be a future date (≥ today)
 *   - room_count:      must be an integer 1–10
 *   - city:            must be ≥ 2 chars, not digits-only
 *   - address, description: must not be empty
 *
 * VANILLA JS ONLY — no jQuery, no external libraries.
 */

/* ── DOM References ─────────────────────────────────────────────────── */
const form            = document.getElementById('new-listing-form');
const totalRentInput  = document.getElementById('total_rent');
const roomCountInput  = document.getElementById('room_count');
const priceOutput     = document.getElementById('price-per-person');
const priceWidget     = document.getElementById('price-calculator');
const descTextarea    = document.getElementById('description');
const descCounter     = document.getElementById('description-counter');
const submitResult    = document.getElementById('submit-result');
const submitBtn       = document.getElementById('btn-submit-listing');
const toastContainer  = document.getElementById('toast-container');

/* ── JS REQUIREMENT #1: Real-time Price Calculator ──────────────────── */
function updatePriceCalculator() {
  const rent  = parseFloat(totalRentInput.value);
  const rooms = parseInt(roomCountInput.value);

  if (!isNaN(rent) && !isNaN(rooms) && rent > 0 && rooms > 0) {
    const perPerson = (rent / rooms).toFixed(0);
    priceOutput.textContent = `₪${Number(perPerson).toLocaleString('he-IL')} / לאדם / חודש`;

    // Brief pulse animation to draw attention to the update
    priceWidget.classList.remove('updated');
    // Force reflow to restart animation
    void priceWidget.offsetWidth;
    priceWidget.classList.add('updated');
  } else {
    priceOutput.textContent = 'הכניסי מחיר ומספר חדרים';
  }
}

// Attach 'input' listeners — fires on every keystroke
totalRentInput.addEventListener('input', updatePriceCalculator);
roomCountInput.addEventListener('input', updatePriceCalculator);

/* ── Description Character Counter ─────────────────────────────────── */
descTextarea.addEventListener('input', function () {
  descCounter.textContent = `${this.value.length} / 2000 תווים`;
});

/* ── Toast Helper ───────────────────────────────────────────────────── */
function showToast(message, type = 'info') {
  const toast = document.createElement('p');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ── Field Validation Helpers ───────────────────────────────────────── */
function setFieldError(inputEl, errorElId, message) {
  inputEl.classList.add('is-invalid');
  inputEl.classList.remove('is-valid');
  document.getElementById(errorElId).textContent = message;
}

function setFieldValid(inputEl, errorElId) {
  inputEl.classList.add('is-valid');
  inputEl.classList.remove('is-invalid');
  document.getElementById(errorElId).textContent = '';
}

/* ── JS VALIDATION REQUIREMENT: Complex Field Validators ────────────── */

/**
 * Validate the 'city' field:
 * - Must have ≥ 2 characters
 * - Must NOT be all digits
 */
function validateCity() {
  const val = document.getElementById('city').value.trim();
  const el  = document.getElementById('city');
  if (val.length < 2) {
    setFieldError(el, 'city-err', 'עיר חייבת להכיל לפחות 2 תווים');
    return false;
  }
  if (/^\d+$/.test(val)) {
    setFieldError(el, 'city-err', 'עיר לא יכולה להכיל ספרות בלבד');
    return false;
  }
  setFieldValid(el, 'city-err');
  return true;
}

/**
 * Validate 'address': must not be empty, min 5 chars
 */
function validateAddress() {
  const val = document.getElementById('address').value.trim();
  const el  = document.getElementById('address');
  if (val.length < 5) {
    setFieldError(el, 'address-err', 'כתובת חייבת להכיל לפחות 5 תווים');
    return false;
  }
  setFieldValid(el, 'address-err');
  return true;
}

/**
 * Validate 'total_rent' (COMPLEX VALIDATION #1):
 * - Must be a number
 * - Must be > 0
 * - Must be ≤ 20,000 ₪
 */
function validateTotalRent() {
  const val = parseFloat(totalRentInput.value);
  if (isNaN(val) || val <= 0) {
    setFieldError(totalRentInput, 'total_rent-err', 'שכר דירה חייב להיות מספר חיובי');
    return false;
  }
  if (val > 20000) {
    setFieldError(totalRentInput, 'total_rent-err', 'שכר דירה לא יכול לעלות על ₪20,000');
    return false;
  }
  setFieldValid(totalRentInput, 'total_rent-err');
  return true;
}

/**
 * Validate 'room_count': must be an integer between 1 and 10
 */
function validateRoomCount() {
  const val = parseInt(roomCountInput.value);
  if (isNaN(val) || val < 1 || val > 10 || !Number.isInteger(val)) {
    setFieldError(roomCountInput, 'room_count-err', 'מספר חדרים חייב להיות מספר שלם בין 1 ל-10');
    return false;
  }
  setFieldValid(roomCountInput, 'room_count-err');
  return true;
}

/**
 * Validate 'available_from' (COMPLEX VALIDATION #2):
 * - Must not be empty
 * - Must be today or a FUTURE date
 */
function validateAvailableFrom() {
  const el  = document.getElementById('available_from');
  const val = el.value;
  if (!val) {
    setFieldError(el, 'available_from-err', 'תאריך כניסה הוא שדה חובה');
    return false;
  }
  const today    = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(val);
  if (selected < today) {
    setFieldError(el, 'available_from-err', 'תאריך הכניסה חייב להיות היום או בעתיד');
    return false;
  }
  setFieldValid(el, 'available_from-err');
  return true;
}

/**
 * Validate 'description': must not be empty, min 10 chars
 */
function validateDescription() {
  const val = descTextarea.value.trim();
  if (val.length < 10) {
    setFieldError(descTextarea, 'description-err', 'תיאור חייב להכיל לפחות 10 תווים');
    return false;
  }
  setFieldValid(descTextarea, 'description-err');
  return true;
}

/**
 * Run all validations and return true only if all pass.
 */
function validateAll() {
  const results = [
    validateCity(),
    validateAddress(),
    validateTotalRent(),
    validateRoomCount(),
    validateAvailableFrom(),
    validateDescription()
  ];
  return results.every(Boolean);
}

/* ── Blur Validation (real-time feedback on field exit) ─────────────── */
document.getElementById('city').addEventListener('blur', validateCity);
document.getElementById('address').addEventListener('blur', validateAddress);
totalRentInput.addEventListener('blur', validateTotalRent);
roomCountInput.addEventListener('blur', validateRoomCount);
document.getElementById('available_from').addEventListener('blur', validateAvailableFrom);
descTextarea.addEventListener('blur', validateDescription);

/* ── Form Submit Handler ─────────────────────────────────────────────── */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Run all validations before submitting
  if (!validateAll()) {
    showToast('אנא תקני את השגיאות בטופס לפני שליחה', 'error');
    // Scroll to first error
    const firstError = form.querySelector('.is-invalid');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'שולחת...';

  const payload = {
    city:                  document.getElementById('city').value.trim(),
    address:               document.getElementById('address').value.trim(),
    total_rent:            parseFloat(totalRentInput.value),
    room_count:            parseInt(roomCountInput.value),
    available_from:        document.getElementById('available_from').value,
    description:           descTextarea.value.trim(),
    roommate_gender_pref:  document.getElementById('roommate_gender_pref').value,
    pet_friendly:          document.getElementById('pet_friendly').checked
  };

  try {
    const res  = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      submitResult.className = 'submit-result success';
      submitResult.textContent = `✅ ${data.message} מספר מודעה: ${data.listing_id}`;
      form.reset();
      priceOutput.textContent = 'הכניסי מחיר ומספר חדרים';
      showToast(data.message, 'success');
    } else {
      submitResult.className = 'submit-result error';
      submitResult.textContent = `❌ ${data.message}`;
    }

    submitResult.scrollIntoView({ behavior: 'smooth', block: 'center' });

  } catch {
    submitResult.className = 'submit-result error';
    submitResult.textContent = '❌ השרת אינו זמין כרגע. הנתונים לא נשמרו.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'פרסמי את הדירה 🚀';
  }
});

/* ── Set minimum date for available_from to today ────────────────────── */
(function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('available_from').setAttribute('min', today);
})();
