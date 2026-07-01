// ===== Config =====
const WEBHOOK_URL = 'https://hook.eu1.make.com/1ggo1x1pf4hmj8k3tdpvx56416u4ik6r';
const BOOKING_URL = 'https://calendar.app.google/xR5ixaAjgD249jur5';

// ===== Data =====
const MOTIVATIONS = ['Work & meetings', 'Travel', 'Confidence speaking', 'Family & friends', 'Living abroad', 'Studying / exams'];

const FOCUS_ITEMS = [
  { key: 'fluency', title: 'Speaking fluently', desc: 'Say more, with fewer pauses' },
  { key: 'confidence', title: 'Confidence to speak up', desc: 'Feel easy starting and holding a conversation' },
  { key: 'vocab', title: 'Everyday vocabulary', desc: 'Natural words for real life, not just work' },
  { key: 'grammar', title: 'Grammar that sticks', desc: 'The small things, fixed gently over time' },
  { key: 'pronunciation', title: 'Clearer pronunciation', desc: 'Be understood the first time' },
];
const FOCUS_LABEL = Object.fromEntries(FOCUS_ITEMS.map(f => [f.key, f.title === 'Confidence to speak up' ? 'Confidence' : f.title]));
FOCUS_LABEL.fluency = 'Speaking fluently';
FOCUS_LABEL.vocab = 'Everyday vocabulary';
FOCUS_LABEL.grammar = 'Grammar';
FOCUS_LABEL.pronunciation = 'Pronunciation';

const INTERESTS = ['Travel', 'Football', 'Family', 'Film & TV', 'Food & cooking', 'Music', 'Business', 'News', 'Books', 'Technology', 'Other sport', 'Art'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };
const TIMES = ['Morning', 'Afternoon', 'Evening'];

const TRAINERS = [
  { id: 'T1', name: 'Elena', tag: 'Native UK English', bio: 'Warm, patient and unflappable.', specialties: ['confidence'], days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], times: ['Afternoon', 'Evening'],
    reasons: ["Brilliant with nervous speakers — just what you're after.", 'Native UK English — clear and easy to follow.'] },
  { id: 'T2', name: 'Daniel', tag: 'Native Irish English', bio: 'Energetic and encouraging, focused on getting you talking more.', specialties: ['fluency'], days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], times: ['Morning'],
    reasons: ['Great for building fluency and momentum.', 'Native Irish English — warm and easy to follow.'] },
  { id: 'T3', name: 'Priya', tag: 'Indian English', bio: 'Precise and encouraging, specializes in clear pronunciation.', specialties: ['pronunciation'], days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], times: ['Evening'],
    reasons: ['Specializes in clear, confident pronunciation.', 'Indian English — a great model for clarity.'] },
];

// ===== State =====
const state = {
  learner_id: 'L-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
  name: '', email: '',
  motivation: [], focus: [], interests: [], days: [], time: '',
  trainer: null,
};

let step = 0; // 0..5 across the 6 onboarding screens

// ===== Trainer matching =====
function matchTrainer() {
  const hardMatch = TRAINERS.filter(t => t.times.includes(state.time) && state.days.some(d => t.days.includes(d)));
  const pool = hardMatch.length ? hardMatch : TRAINERS;
  const score = t => state.focus.reduce((s, f) => s + (t.specialties.includes(f) ? 1 : 0), 0);
  pool.sort((a, b) => score(b) - score(a));
  return pool[0];
}

function whenSummary() {
  const days = state.days.length ? state.days.map(d => DAYS_SHORT[d]).join(', ') : '';
  const time = state.time ? state.time + 's' : '';
  return [days, time].filter(Boolean);
}

// ===== Panel render =====
function renderPanel() {
  const panel = document.getElementById('panel');
  const rows = [
    { label: 'Why English', values: state.motivation, active: step >= 0 },
    { label: 'Focus', values: state.focus.map(f => FOCUS_LABEL[f]), active: step >= 1 },
    { label: 'Interests', values: state.interests, active: step >= 2 },
    { label: 'When', values: whenSummary(), active: step >= 3 },
    { label: 'Your trainer', values: state.trainer ? [state.trainer.name + ' · ' + state.trainer.tag.split(' ').pop()] : [], active: step >= 4 },
  ];
  panel.innerHTML = `
    <div class="panel-title">YOUR SPEAKEASY</div>
    ${rows.map(r => `
      <div class="panel-row ${r.active && r.values.length ? 'active' : ''}">
        <div class="label">${r.label}</div>
        ${r.values.length ? `<div class="chips">${r.values.map(v => `<span class="val-chip">${v}</span>`).join('')}</div>` : `<span class="dash">—</span>`}
      </div>
    `).join('')}
  `;
}

// ===== Progress bar =====
function renderProgress() {
  const bar = document.getElementById('progress');
  bar.innerHTML = Array.from({ length: 6 }).map((_, i) => `<div class="seg ${i <= step ? 'done' : ''}"></div>`).join('');
}

// ===== Step renderers =====
function toggle(arr, val) {
  const i = arr.indexOf(val);
  if (i === -1) arr.push(val); else arr.splice(i, 1);
}

function renderStep() {
  renderProgress();
  renderPanel();
  const card = document.getElementById('card-content');
  const back = `<button class="btn-link" onclick="goBack()">← Back</button>`;

  if (step === 0) {
    card.innerHTML = `
      <div class="card-header">
        <div class="eyebrow">A LITTLE ABOUT YOU</div>
        <h1>Why are you learning English?</h1>
        <p class="subtext">Pick anything that fits — it helps us point your practice the right way.</p>
      </div>
      <div class="chip-wrap">${MOTIVATIONS.map(m => `<div class="chip ${state.motivation.includes(m) ? 'selected' : ''}" data-val="${m}">${m}</div>`).join('')}</div>
      <div class="footer-row">${step === 0 ? '<span></span>' : back}<button class="btn btn-primary" id="next-btn">Continue</button></div>
    `;
    card.querySelectorAll('.chip').forEach(el => el.onclick = () => { toggle(state.motivation, el.dataset.val); renderStep(); });
    document.getElementById('next-btn').onclick = () => { if (state.motivation.length) goNext(); };
  }

  if (step === 1) {
    card.innerHTML = `
      <div class="card-header">
        <div class="eyebrow">YOUR FOCUS</div>
        <h1>What would you like to work on?</h1>
        <p class="subtext">Choose what matters most right now. You and your trainer can change this anytime.</p>
      </div>
      <div class="focus-list">${FOCUS_ITEMS.map(f => `
        <div class="focus-item ${state.focus.includes(f.key) ? 'selected' : ''}" data-val="${f.key}">
          <span class="checkbox">${state.focus.includes(f.key) ? '✓' : ''}</span>
          <span class="text"><strong>${f.title}</strong><span>${f.desc}</span></span>
        </div>`).join('')}</div>
      <div class="footer-row">${back}<button class="btn btn-primary" id="next-btn">Continue</button></div>
    `;
    card.querySelectorAll('.focus-item').forEach(el => el.onclick = () => { toggle(state.focus, el.dataset.val); renderStep(); });
    document.getElementById('next-btn').onclick = () => { if (state.focus.length) goNext(); };
  }

  if (step === 2) {
    card.innerHTML = `
      <div class="card-header">
        <div class="eyebrow">WHAT YOU'RE INTO</div>
        <h1>What do you actually enjoy?</h1>
        <p class="subtext">We build your practice around real topics — so you're talking about things you'd talk about anyway.</p>
      </div>
      <div class="chip-wrap">${INTERESTS.map(m => `<div class="chip ${state.interests.includes(m) ? 'selected' : ''}" data-val="${m}">${m}</div>`).join('')}</div>
      <div class="footer-row">${back}<button class="btn btn-primary" id="next-btn">Continue</button></div>
    `;
    card.querySelectorAll('.chip').forEach(el => el.onclick = () => { toggle(state.interests, el.dataset.val); renderStep(); });
    document.getElementById('next-btn').onclick = () => { if (state.interests.length) goNext(); };
  }

  if (step === 3) {
    card.innerHTML = `
      <div class="card-header">
        <div class="eyebrow">TIMING</div>
        <h1>When suits you?</h1>
        <p class="subtext">So we can match you with a trainer who's free when you are.</p>
      </div>
      <div class="two-col">
        <div>
          <div class="field-label">Days that usually work</div>
          <div class="chip-wrap">${DAYS.map(d => `<div class="chip ${state.days.includes(d) ? 'selected' : ''}" data-val="${d}">${d}</div>`).join('')}</div>
        </div>
        <div>
          <div class="field-label">Time of day</div>
          <div class="segmented">${TIMES.map(t => `<button class="seg-btn ${state.time === t ? 'selected' : ''}" data-val="${t}">${t}</button>`).join('')}</div>
        </div>
      </div>
      <div class="footer-row">${back}<button class="btn btn-primary" id="next-btn">Continue</button></div>
    `;
    card.querySelectorAll('.chip').forEach(el => el.onclick = () => { toggle(state.days, el.dataset.val); renderStep(); });
    card.querySelectorAll('.seg-btn').forEach(el => el.onclick = () => { state.time = el.dataset.val; renderStep(); });
    document.getElementById('next-btn').onclick = () => { if (state.days.length && state.time) goNext(); };
  }

  if (step === 4) {
    if (!state.trainer) state.trainer = matchTrainer();
    const t = state.trainer;
    card.innerHTML = `
      <div class="card-header">
        <div class="eyebrow">YOUR MATCH</div>
        <h1>Meet ${t.name}.</h1>
        <p class="subtext">Based on what you told us — and when you're free — here's who we'd pair you with. One match, chosen for you.</p>
      </div>
      <div class="trainer-box">
        <div class="avatar">${t.name.slice(0, 2).toUpperCase()}</div>
        <div class="trainer-info"><strong>${t.name}</strong><span class="tag">${t.tag.toUpperCase()}</span><span class="line">${t.bio}</span></div>
      </div>
      <div class="reasons">${t.reasons.map(r => `<div class="reason"><span class="dot">✓</span>${r}</div>`).join('')}</div>
      <div style="text-align:right;"><span class="note">Prefer someone else?</span></div>
      <div class="footer-row">${back}<button class="btn btn-primary" id="next-btn">Book your intro call →</button></div>
    `;
    document.getElementById('next-btn').onclick = () => { submitProfile(); goNext(); };
  }

  if (step === 5) {
    card.innerHTML = `
      <div class="card-header">
        <div class="free-badge">✓ Free · no card needed today</div>
        <h1>Book your intro call.</h1>
        <p class="subtext">Think of it as a no-risk trial. Pick a time that works for you on the calendar below — no test, just a relaxed conversation so ${state.trainer.name} can hear how you speak. You only choose a plan afterwards, if you're happy.</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="field-label" style="margin:0;">When you're ready</div>
        <div class="booking-cta">
          <a class="btn btn-primary" href="${BOOKING_URL}" target="_blank" rel="noopener">Open the booking calendar →</a>
          <span class="note">Opens in a new tab. Come back here once you've picked a time.</span>
        </div>
      </div>
      <div class="footer-row">${back}<button class="btn btn-primary" id="next-btn">I've booked — continue →</button></div>
    `;
    document.getElementById('next-btn').onclick = () => goNext();
  }
}

function goNext() {
  step++;
  if (step > 5) { showConfirm(); return; }
  renderStep();
}
function goBack() {
  if (step === 0) { showSignup(); return; }
  step--;
  renderStep();
}

// ===== Section switching =====
function showSignup() {
  document.getElementById('step-signup').style.display = '';
  document.getElementById('step-onboarding').style.display = 'none';
  document.getElementById('step-confirm').style.display = 'none';
}
function showOnboarding() {
  document.getElementById('step-signup').style.display = 'none';
  document.getElementById('step-onboarding').style.display = '';
  document.getElementById('step-confirm').style.display = 'none';
  renderStep();
}
function showConfirm() {
  document.getElementById('step-signup').style.display = 'none';
  document.getElementById('step-onboarding').style.display = 'none';
  document.getElementById('step-confirm').style.display = '';
  document.getElementById('confirm-subtext').textContent =
    `You'll get a calendar invite as soon as your intro call with ${state.trainer.name} is confirmed. Here's what happens next:`;
  document.getElementById('confirm-trainer-1').textContent = state.trainer.name;
  saveLocalState();
}

// ===== Backend call =====
async function submitProfile() {
  const payload = {
    learner_id: state.learner_id,
    name: state.name,
    email: state.email,
    motivation: state.motivation.join(', '),
    focus: state.focus.map(f => FOCUS_LABEL[f]).join(', '),
    interests: state.interests.join(', '),
    availability_days: state.days.map(d => DAYS_SHORT[d]).join(', '),
    availability_time: state.time,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    matched_trainer: state.trainer.name,
  };
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });
    console.log('Sent to Speakeasy backend:', payload);
  } catch (err) {
    console.error('Could not reach Speakeasy backend', err);
  }
}

function saveLocalState() {
  localStorage.setItem('speakeasy_learner', JSON.stringify(state));
}

// ===== Sign-up submit =====
document.getElementById('signup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  state.name = document.getElementById('su-name').value.trim();
  state.email = document.getElementById('su-email').value.trim();
  if (!state.name || !state.email) return;
  showOnboarding();
});
