'use strict';

/**
 * home.js — מסך 1: דף הבית
 *
 * JS REQUIREMENT #3 IMPLEMENTATION:
 * "אלמנט שמגיב לאירוע (לחיצה) שמשנה משהו מהותי במסך"
 * → showAuthPanel() is called onClick from HTML tab buttons.
 *   It switches .active class between Login/Register panels
 *   and their corresponding tab buttons — no page reload.
 *
 * Also handles: Login form, Register form, session status,
 * logout, inline validation feedback.
 *
 * VANILLA JS ONLY — no jQuery, no external libraries.
 */

/* ── DOM References ─────────────────────────────────────────────────── */
const loginForm    = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabLogin     = document.getElementById('tab-login');
const tabRegister  = document.getElementById('tab-register');
const panelLogin   = document.getElementById('panel-login');
const panelRegister= document.getElementById('panel-register');
const navUserInfo  = document.getElementById('nav-user-info');
const navUsername  = document.getElementById('nav-username');
const btnLogout    = document.getElementById('btn-logout');
const toastContainer = document.getElementById('toast-container');

/* ── JS REQUIREMENT #3: Tab Toggle ─────────────────────────────────── */
/**
 * Switches the active auth panel (Login ↔ Register).
 * Called from onclick attributes in the HTML.
 * @param {'login'|'register'} panelName
 */
function showAuthPanel(panelName) {
  // Toggle tab button states
  tabLogin.classList.toggle('active',    panelName === 'login');
  tabRegister.classList.toggle('active', panelName === 'register');

  // Update ARIA for accessibility
  tabLogin.setAttribute('aria-selected',    panelName === 'login' ? 'true' : 'false');
  tabRegister.setAttribute('aria-selected', panelName === 'register' ? 'true' : 'false');

  // Toggle panel visibility
  panelLogin.classList.toggle('active',    panelName === 'login');
  panelRegister.classList.toggle('active', panelName === 'register');

  // Clear any previous form errors when switching tabs
  clearAllErrors();
}

// Expose to global scope so HTML onclick attributes can call it
window.showAuthPanel = showAuthPanel;

/* ── Toast Notifications ────────────────────────────────────────────── */
/**
 * Shows a temporary toast message.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('p');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Auto-remove after 3 seconds (matches CSS animation duration)
  setTimeout(() => toast.remove(), 3000);
}

/* ── Field Validation Helpers ───────────────────────────────────────── */
function setFieldError(inputEl, errorEl, message) {
  inputEl.classList.add('is-invalid');
  inputEl.classList.remove('is-valid');
  errorEl.textContent = message;
}

function setFieldValid(inputEl, errorEl) {
  inputEl.classList.add('is-valid');
  inputEl.classList.remove('is-invalid');
  errorEl.textContent = '';
}

function clearAllErrors() {
  document.querySelectorAll('.form-control').forEach(el => {
    el.classList.remove('is-valid', 'is-invalid');
  });
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
  });
}

/* ── Login Validation ───────────────────────────────────────────────── */
function validateLoginForm() {
  const username = document.getElementById('login-username');
  const password = document.getElementById('login-password');
  const usernameErr = document.getElementById('login-username-err');
  const passwordErr = document.getElementById('login-password-err');
  let valid = true;

  if (!username.value.trim()) {
    setFieldError(username, usernameErr, 'שם משתמש הוא שדה חובה');
    valid = false;
  } else {
    setFieldValid(username, usernameErr);
  }

  if (!password.value) {
    setFieldError(password, passwordErr, 'סיסמה היא שדה חובה');
    valid = false;
  } else {
    setFieldValid(password, passwordErr);
  }

  return valid;
}

/* ── Register Validation ────────────────────────────────────────────── */
function validateRegisterForm() {
  let valid = true;

  const fields = [
    { id: 'reg-username',    errId: 'reg-username-err',  check: v => v.trim().length >= 3 && v.trim().length <= 20 && !/\s/.test(v), msg: 'שם משתמש: 3–20 תווים, ללא רווחים' },
    { id: 'reg-password',    errId: 'reg-password-err',  check: v => v.length >= 6,     msg: 'סיסמה חייבת להכיל לפחות 6 תווים' },
    { id: 'reg-city',        errId: 'reg-city-err',      check: v => v.trim().length >= 2, msg: 'עיר חייבת להכיל לפחות 2 תווים' },
    { id: 'reg-budget',      errId: 'reg-budget-err',    check: v => v !== '',          msg: 'יש לבחור טווח תקציב' },
    { id: 'reg-lifestyle',   errId: 'reg-lifestyle-err', check: v => v !== '',          msg: 'יש לבחור סגנון חיים' },
    { id: 'reg-pet',         errId: 'reg-pet-err',       check: v => v !== '',          msg: 'יש לבחור עמדה לגבי חיות' },
    { id: 'reg-smoking',     errId: 'reg-smoking-err',   check: v => v !== '',          msg: 'יש לבחור עמדה לגבי עישון' },
    { id: 'reg-gender-pref', errId: 'reg-gender-err',    check: v => v !== '',          msg: 'יש לבחור העדפת מגדר' }
  ];

  fields.forEach(({ id, errId, check, msg }) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(errId);
    if (!check(el.value)) {
      setFieldError(el, err, msg);
      valid = false;
    } else {
      setFieldValid(el, err);
    }
  });

  return valid;
}

/* ── Session Status Check ───────────────────────────────────────────── */
async function checkSessionStatus() {
  try {
    const res  = await fetch('/api/auth/status');
    const data = await res.json();

    if (data.loggedIn) {
      showLoggedInState(data.user.username);
    }
  } catch {
    // Server not running — silently ignore (static preview mode)
  }
}

function showLoggedInState(username) {
  navUsername.textContent = username;
  navUserInfo.removeAttribute('hidden');
  // Hide the auth widget when already logged in
  const authWidget = document.querySelector('.auth-widget');
  if (authWidget) {
    authWidget.innerHTML = `
      <p style="text-align:center; color: var(--clr-primary-light); font-size: var(--fs-md); font-weight: 600;">
        👋 שלום, ${username}!<br>
        <span style="color: var(--clr-text-muted); font-size: var(--fs-sm); font-weight:400;">
          את מחוברת לחשבון שלך.
        </span>
      </p>
      <a href="listings.html" class="btn btn--primary btn--full" style="margin-top:1.5rem">
        לוח הדירות 🔍
      </a>
    `;
  }
}

/* ── Login Submit Handler ───────────────────────────────────────────── */
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateLoginForm()) return;

  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  btn.textContent = 'מתחברת...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: document.getElementById('login-username').value.trim(),
        password: document.getElementById('login-password').value
      })
    });

    const data = await res.json();

    if (data.success) {
      showToast(data.message, 'success');
      showLoggedInState(data.user.username);
    } else {
      showToast(data.message, 'error');
    }
  } catch {
    showToast('השרת אינו זמין כרגע. נסי שוב מאוחר יותר.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'התחברות →';
  }
});

/* ── Register Submit Handler ────────────────────────────────────────── */
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateRegisterForm()) return;

  const btn = document.getElementById('btn-register');
  btn.disabled = true;
  btn.textContent = 'נרשמת...';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username:              document.getElementById('reg-username').value.trim(),
        password:              document.getElementById('reg-password').value,
        city_preference:       document.getElementById('reg-city').value.trim(),
        budget_range:          document.getElementById('reg-budget').value,
        lifestyle_type:        document.getElementById('reg-lifestyle').value,
        pet_policy:            document.getElementById('reg-pet').value,
        smoking_policy:        document.getElementById('reg-smoking').value,
        roommate_gender_pref:  document.getElementById('reg-gender-pref').value
      })
    });

    const data = await res.json();

    if (data.success) {
      showToast(data.message, 'success');
      showLoggedInState(data.user.username);
    } else {
      showToast(data.message, 'error');
    }
  } catch {
    showToast('השרת אינו זמין כרגע. נסי שוב מאוחר יותר.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'הצטרפי עכשיו 🚀';
  }
});

/* ── Logout Handler ─────────────────────────────────────────────────── */
btnLogout.addEventListener('click', async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch { /* ignore */ }
  showToast('התנתקת בהצלחה. להתראות! 👋', 'info');
  setTimeout(() => window.location.reload(), 1500);
});

/* ── Inline validation on blur ──────────────────────────────────────── */
document.getElementById('login-username').addEventListener('blur', function () {
  const err = document.getElementById('login-username-err');
  if (!this.value.trim()) setFieldError(this, err, 'שם משתמש הוא שדה חובה');
  else setFieldValid(this, err);
});

document.getElementById('login-password').addEventListener('blur', function () {
  const err = document.getElementById('login-password-err');
  if (!this.value) setFieldError(this, err, 'סיסמה היא שדה חובה');
  else setFieldValid(this, err);
});

/* ── Init ───────────────────────────────────────────────────────────── */
checkSessionStatus();
