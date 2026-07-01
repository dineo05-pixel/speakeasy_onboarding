const DEMO = {
  learner_id: 'L-DEMO0001', name: 'Marco Rossi', email: 'marco@example.com',
  motivation: ['Work & meetings', 'Confidence speaking'],
  focus: ['confidence', 'vocab'],
  interests: ['Travel', 'Football', 'Family'],
  days: ['Tuesday', 'Thursday', 'Friday'], time: 'Afternoon',
  trainer: { name: 'Elena', tag: 'Native UK English', bio: 'Warm, patient and unflappable.',
    reasons: ["Brilliant with nervous speakers — just what you're after.", 'Native UK English — clear and easy to follow.'] },
};

const FOCUS_LABEL = { fluency: 'Speaking fluently', confidence: 'Confidence', vocab: 'Everyday vocabulary', grammar: 'Grammar', pronunciation: 'Pronunciation' };
const FP_DIMENSIONS = [
  { key: 'fluency', name: 'Speaking fluency' },
  { key: 'confidence', name: 'Confidence' },
  { key: 'vocab', name: 'Vocabulary' },
  { key: 'grammar', name: 'Grammar' },
  { key: 'pronunciation', name: 'Pronunciation' },
];

function load() {
  try {
    const raw = localStorage.getItem('speakeasy_learner');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.name && parsed.trainer) return parsed;
    }
  } catch (e) {}
  return DEMO;
}

const data = load();
const firstName = (data.name || 'there').split(' ')[0];
const days = (data.days || []).join(', ');

document.getElementById('dash-welcome').textContent = `Welcome back, ${firstName}`;
document.getElementById('dash-trainer-name').textContent = data.trainer.name;
document.getElementById('dash-step2').textContent = `${data.trainer.name} builds a lesson from your goals.`;
document.getElementById('dash-meet-trainer').textContent = `Meet ${data.trainer.name}`;
document.getElementById('dash-trainer-tag').textContent = data.trainer.tag;
document.getElementById('dash-trainer-bio').textContent = data.trainer.bio;
document.getElementById('dash-why-matched').textContent =
  `Your focus on ${(data.focus || []).map(f => FOCUS_LABEL[f] || f).join(' and ')}, and your ${days || 'weekly'} availability, lined up with ${data.trainer.name}'s schedule and specialty.`;
document.getElementById('dash-roadmap-caption').textContent =
  `Built around ${(data.focus || []).map(f => FOCUS_LABEL[f] || f).join(' and ') || 'your focus'} — your focus areas.`;

// Fingerprint: selected focus areas show as ACTIVE, rest as DETECTED
const fpRow = document.getElementById('dash-fp-row');
fpRow.innerHTML = FP_DIMENSIONS.map(d => {
  const isFocus = (data.focus || []).includes(d.key);
  const state = isFocus ? 'active' : 'detected';
  const label = isFocus ? 'ACTIVE' : 'DETECTED';
  const note = isFocus
    ? `Front and centre for your first sessions with ${data.trainer.name}.`
    : `${data.trainer.name} will get a first read on this at your intro call.`;
  return `<div class="fp-chip"><span class="name">${d.name}</span><span class="state-pill ${state}">${label}</span><span class="note">${note}</span></div>`;
}).join('');

// Answers
const answers = [
  { k: 'MOTIVATION', v: (data.motivation || []).join(', ') || '—' },
  { k: 'FOCUS', v: (data.focus || []).map(f => FOCUS_LABEL[f] || f).join(', ') || '—' },
  { k: 'INTERESTS', v: (data.interests || []).join(', ') || '—' },
  { k: 'AVAILABILITY', v: `${days || '—'}${data.time ? ' · ' + data.time : ''}` },
];
document.getElementById('dash-answers').innerHTML = answers.map(a => `<div class="answer-row"><span class="k">${a.k}</span><span class="v">${a.v}</span></div>`).join('');

// Materials — lightly personalized
const primaryInterest = (data.interests || ['your interests'])[0];
const primaryMotivation = (data.motivation || ['your goals'])[0];
const materials = [
  { tag: 'PRACTICE PACK', title: `Confidence for ${primaryMotivation.toLowerCase()}`, desc: 'Phrases for real situations you actually face.' },
  { tag: 'LESSON NOTES', title: 'Intro call notes', desc: `What ${data.trainer.name} noticed, in plain language.` },
  { tag: 'PRACTICE PACK', title: `${primaryInterest} small talk`, desc: "Easier to speak about what you love." },
];
document.getElementById('dash-materials').innerHTML = materials.map(m => `
  <div class="material-item">
    <span class="tag">${m.tag}</span>
    <strong>${m.title}</strong>
    <span class="desc">${m.desc}</span>
    <a href="#">Open →</a>
  </div>`).join('');

// Sessions
document.getElementById('dash-sessions').innerHTML = `
  <div class="session-row">
    <div class="left"><strong>Intro call</strong><span>with ${data.trainer.name}</span></div>
    <div class="right"><span class="status-pill scheduled">PENDING</span><span class="note">Book from the confirmation page</span></div>
  </div>
`;
