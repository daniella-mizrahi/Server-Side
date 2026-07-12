'use strict';

/**
 * listings.js — מסך 3: לוח דירות + טופס מועמדות
 *
 * JS REQUIREMENT #2 IMPLEMENTATION:
 * "העברת נתונים בין מסכים / בין אזורים"
 * → When user clicks "שלח פנייה" on a listing card:
 *   1. The listing's ID is read from the card's data-listing-id attribute
 *   2. That ID is written into the hidden input #hidden-listing-id
 *   3. The form section becomes visible and the page scrolls to it
 *   4. The ID is displayed in the banner and the form title updates
 *   This is pure data-passing within the page using Vanilla JS DOM manipulation.
 *
 * Also handles:
 *   - Fetching listings from API and rendering cards dynamically
 *   - Application form validation and submission
 *   - Fallback seed data when server is not running
 *
 * VANILLA JS ONLY — no jQuery, no external libraries.
 */

/* ── DOM References ─────────────────────────────────────────────────── */
const listingsGrid        = document.getElementById('listings-grid');
const listingsLoader      = document.getElementById('listings-loader');
const applicationSection  = document.getElementById('application-section');
const hiddenListingId     = document.getElementById('hidden-listing-id');
const selectedDisplay     = document.getElementById('selected-listing-display');
const appFormTitle        = document.getElementById('app-form-title');
const appFormSubtitle     = document.getElementById('app-form-subtitle');
const applicationForm     = document.getElementById('application-form');
const btnCancelApp        = document.getElementById('btn-cancel-app');
const appSubmitResult     = document.getElementById('app-submit-result');
const toastContainer      = document.getElementById('toast-container');

/* ── Seed Data (fallback when server is offline) ─────────────────────── */
const SEED_LISTINGS = [
  {
    listing_id: 1,
    city: 'תל אביב',
    address: 'רחוב דיזנגוף 55, דירה 4',
    total_rent: 5800,
    room_count: 3,
    available_from: '2026-08-01',
    description: 'דירה מרווחת ובהירה בלב הצפון, 2 דקות מהים. מרפסת שמש, חניה, ממ"ד. שותפה נוכחית מחפשת שותפה חדשה.',
    roommate_gender_pref: 'female_only',
    pet_friendly: 1,
    posted_by_username: 'noakk24'
  },
  {
    listing_id: 2,
    city: 'ירושלים',
    address: 'רחוב יפו 120, דירה 2',
    total_rent: 4200,
    room_count: 4,
    available_from: '2026-09-01',
    description: 'דירה מסורתית ושקטה ליד שוק מחנה יהודה. קרובה לאוניברסיטה העברית ולמרכז העיר.',
    roommate_gender_pref: 'any',
    pet_friendly: 0,
    posted_by_username: 'meitalli'
  },
  {
    listing_id: 3,
    city: 'חיפה',
    address: 'שדרות הנשיא 12, דירה 7',
    total_rent: 3600,
    room_count: 3,
    available_from: '2026-07-15',
    description: 'נוף לים מהסלון! דירה מעוצבת בכרמל, רגועה, עם חניה וממ"ד. מחפשות שותפה נוספת.',
    roommate_gender_pref: 'female_only',
    pet_friendly: 1,
    posted_by_username: 'shira_r'
  },
  {
    listing_id: 4,
    city: 'תל אביב',
    address: 'רחוב אלנבי 80, דירה 1',
    total_rent: 6400,
    room_count: 4,
    available_from: '2026-08-15',
    description: 'דירה ענקית ומושקעת בדרום תל אביב. קרובה לשוק הכרמל ולים. שתי שותפות קיימות.',
    roommate_gender_pref: 'any',
    pet_friendly: 0,
    posted_by_username: 'dana_t'
  }
];

/* ── Toast Helper ───────────────────────────────────────────────────── */
function showToast(message, type = 'info') {
  const toast = document.createElement('p');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ── Formatting Helpers ─────────────────────────────────────────────── */
function formatPrice(price) {
  return Number(price).toLocaleString('he-IL');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function genderLabel(pref) {
  const map = { female_only: 'נשים בלבד', male_only: 'גברים בלבד', any: 'ללא העדפה' };
  return map[pref] || pref;
}

/* ── Card Renderer ──────────────────────────────────────────────────── */
/**
 * Creates a listing card <article> element from listing data.
 * Crucially, attaches data-listing-id for the data-transfer mechanism.
 */
function createListingCard(listing) {
  const pricePerPerson = Math.round(listing.total_rent / listing.room_count);

  const card = document.createElement('article');
  card.className = 'listing-card';
  card.setAttribute('data-listing-id', listing.listing_id);  // ← JS Req #2 data source

  card.innerHTML = `
    <div class="listing-card__accent-bar" aria-hidden="true"></div>
    <div class="listing-card__body">
      <p class="listing-card__city">📍 ${listing.city}</p>
      <h2 class="listing-card__address">${listing.address}</h2>

      <ul class="listing-card__meta" aria-label="פרטי הדירה">
        <li><span class="badge badge--primary">🛏 ${listing.room_count} חדרים</span></li>
        <li><span class="badge badge--accent">👥 ${genderLabel(listing.roommate_gender_pref)}</span></li>
        ${listing.pet_friendly ? '<li><span class="badge badge--success">🐾 ידידותית לחיות</span></li>' : ''}
        <li><span class="badge badge--primary">📅 מ-${formatDate(listing.available_from)}</span></li>
      </ul>

      <p class="listing-card__desc">${listing.description}</p>

      <footer class="listing-card__footer">
        <div class="listing-card__price">
          ₪${formatPrice(pricePerPerson)}
          <small>/ לאדם / חודש</small>
        </div>

        <!--
          JS REQUIREMENT #2: This button triggers selectListing(listingId).
          The ID travels from data-listing-id → hidden form input.
        -->
        <button
          class="btn-apply"
          data-listing-id="${listing.listing_id}"
          data-listing-address="${listing.address}"
          onclick="selectListing(${listing.listing_id}, '${listing.address.replace(/'/g, '\\\'')}')"
          aria-label="שלח פנייה לדירה ב${listing.address}"
        >
          שלח פנייה ✉️
        </button>
      </footer>
    </div>
  `;

  return card;
}

/* ── Load Listings from API ─────────────────────────────────────────── */
async function loadListings() {
  listingsLoader.style.display = 'flex';
  listingsGrid.innerHTML = '';

  try {
    const res  = await fetch('/api/listings');
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      renderListings(data.data);
    } else if (data.success && data.data.length === 0) {
      renderEmpty();
    } else {
      throw new Error('API returned failure');
    }
  } catch {
    // Server offline — use seed data for static preview
    console.info('[listings.js] Server offline, using seed data');
    renderListings(SEED_LISTINGS);
  } finally {
    listingsLoader.style.display = 'none';
  }
}

function renderListings(listings) {
  listingsGrid.innerHTML = '';
  listings.forEach(listing => {
    const card = createListingCard(listing);
    listingsGrid.appendChild(card);
  });
}

function renderEmpty() {
  listingsGrid.innerHTML = `
    <div class="empty-state">
      <p class="empty-state__icon">🏠</p>
      <h3>אין דירות זמינות כרגע</h3>
      <p>היי הראשונה לפרסם!</p>
      <a href="new-listing.html" class="btn btn--primary" style="margin-top:1.5rem; display:inline-flex">
        פרסמי דירה →
      </a>
    </div>
  `;
}

/* ── JS REQUIREMENT #2: Data Transfer Function ──────────────────────── */
/**
 * Called when user clicks "שלח פנייה" on any listing card.
 * Transfers the listing's ID from the card into the application form.
 *
 * @param {number} listingId    - The ID of the selected listing
 * @param {string} listingAddress - Human-readable address for display
 */
function selectListing(listingId, listingAddress) {
  // STEP 1: Write the ID into the hidden form input
  hiddenListingId.value = listingId;

  // STEP 2: Update the visible banner to confirm which listing was selected
  selectedDisplay.textContent = listingId;

  // STEP 3: Update form title and subtitle with the selected listing's context
  appFormTitle.textContent    = `📩 מועמדות לדירה מספר ${listingId}`;
  appFormSubtitle.textContent = `${listingAddress}`;

  // STEP 4: Reveal the form section (it was hidden by CSS)
  applicationSection.classList.add('visible');

  // STEP 5: Smooth scroll to the form so the user sees it immediately
  applicationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // STEP 6: Reset any previous submission results
  appSubmitResult.className    = 'submit-result';
  appSubmitResult.textContent  = '';
  applicationForm.reset();
  // Re-apply the listing ID after form reset
  hiddenListingId.value = listingId;

  // Set min date for move-in
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('app-move-in').setAttribute('min', today);

  showToast(`דירה מספר ${listingId} נבחרה. מלאי את פרטי הפנייה למטה.`, 'info');
}

// Expose to global scope so HTML onclick attributes can call it
window.selectListing = selectListing;

/* ── Cancel Application ─────────────────────────────────────────────── */
btnCancelApp.addEventListener('click', () => {
  applicationSection.classList.remove('visible');
  hiddenListingId.value = '';
  applicationForm.reset();
  applicationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ── Application Form Validation ────────────────────────────────────── */
function setFieldError(el, errId, msg) {
  el.classList.add('is-invalid');
  el.classList.remove('is-valid');
  document.getElementById(errId).textContent = msg;
}

function setFieldValid(el, errId) {
  el.classList.add('is-valid');
  el.classList.remove('is-invalid');
  document.getElementById(errId).textContent = '';
}

function validateAppForm() {
  let valid = true;

  const message    = document.getElementById('app-message');
  const occupation = document.getElementById('app-occupation');
  const moveIn     = document.getElementById('app-move-in');
  const budget     = document.getElementById('app-budget');
  const today      = new Date().toISOString().split('T')[0];

  if (message.value.trim().length < 20) {
    setFieldError(message, 'app-message-err', 'ההצגה חייבת להכיל לפחות 20 תווים');
    valid = false;
  } else {
    setFieldValid(message, 'app-message-err');
  }

  if (occupation.value.trim().length < 2) {
    setFieldError(occupation, 'app-occupation-err', 'עיסוק הוא שדה חובה');
    valid = false;
  } else {
    setFieldValid(occupation, 'app-occupation-err');
  }

  if (!moveIn.value || moveIn.value < today) {
    setFieldError(moveIn, 'app-move-in-err', 'תאריך הכניסה חייב להיות בעתיד');
    valid = false;
  } else {
    setFieldValid(moveIn, 'app-move-in-err');
  }

  const budgetVal = parseFloat(budget.value);
  if (isNaN(budgetVal) || budgetVal < 100) {
    setFieldError(budget, 'app-budget-err', 'תקציב חייב להיות מספר חיובי');
    valid = false;
  } else {
    setFieldValid(budget, 'app-budget-err');
  }

  return valid;
}

/* ── Application Form Submit ─────────────────────────────────────────── */
applicationForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!hiddenListingId.value) {
    showToast('שגיאה: לא נבחרה דירה. אנא לחצי על "שלח פנייה" בכרטיס הדירה.', 'error');
    return;
  }

  if (!validateAppForm()) {
    showToast('אנא תקני את השגיאות בטופס', 'error');
    return;
  }

  const submitBtn = document.getElementById('btn-submit-app');
  submitBtn.disabled    = true;
  submitBtn.textContent = 'שולחת...';

  const payload = {
    listing_id_ref: parseInt(hiddenListingId.value),
    message:        document.getElementById('app-message').value.trim(),
    move_in_date:   document.getElementById('app-move-in').value,
    monthly_budget: parseFloat(document.getElementById('app-budget').value),
    has_pets:       document.getElementById('app-has-pets').checked,
    is_smoker:      document.getElementById('app-is-smoker').checked,
    occupation:     document.getElementById('app-occupation').value.trim()
  };

  try {
    const res  = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      appSubmitResult.className   = 'submit-result success';
      appSubmitResult.textContent = `✅ ${data.message}`;
      applicationForm.reset();
      hiddenListingId.value = '';
      showToast(data.message, 'success');
    } else {
      appSubmitResult.className   = 'submit-result error';
      appSubmitResult.textContent = `❌ ${data.message}`;
    }

  } catch {
    appSubmitResult.className   = 'submit-result error';
    appSubmitResult.textContent = '❌ השרת אינו זמין. המועמדות לא נשמרה.';
  } finally {
    submitBtn.disabled    = false;
    submitBtn.textContent = 'שלחי מועמדות 📩';
  }
});

/* ── Init ───────────────────────────────────────────────────────────── */
loadListings();
