/* ═══════════════════════════════════════════════════════
   A WORLD WITHOUT RULES — Unit Test · script.js
   Sequential flow: Vocab → Comp MC → Written → Cloze
   No section choice — each unlocks only after the previous is submitted.
   No feedback during quiz · single attempt per section
   Game keys: wwrt_vocab · wwrt_comp · wwrt_cloze
   Written: action:'written' → wwrt_comp_written
   PIN: 9377
═══════════════════════════════════════════════════════ */

/* ── CONFIG ─────────────────────────────────────────── */
const INSTRUCT_SECS = 20;
const READ_SECS     = 12;
const STORAGE_KEY   = 'wwrt_session_v1';
const SCORES_KEY    = 'wwrt_scores_v1';
const WRITTEN_KEY   = 'wwrt_written_v1';
const WWRT_SESSION_ID_KEY = 'wwrt_session_id_v1';
const SESSION_ID = (() => {
  let id = localStorage.getItem(WWRT_SESSION_ID_KEY);
  if (!id) { id = 'WWRT-' + Math.random().toString(36).slice(2, 9).toUpperCase(); localStorage.setItem(WWRT_SESSION_ID_KEY, id); }
  return id;
})();

// Fixed order — students cannot skip or reorder sections
const SECTION_SEQUENCE = ['vocab', 'comp', 'written', 'cloze'];

/* ── SHEET URL ───────────────────────────────────────── */
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzv8CWv1yyi8NeH04now9UxVL4IZm5yMqqsEGMcgGdrcAOWVB-aSp5siTvSSJXIUpzFMA/exec';

/* ── WRITTEN PROMPTS ─────────────────────────────────── */
const WRITTEN_PROMPTS = [
  {
    id: 'W1',
    type: 'Extended Response',
    prompt: 'In "A World Without Rules," the author describes several problems that would happen without government and laws. Choose TWO problems from the story and explain why each one is dangerous or unfair. Use specific details from the text to support your answer.',
    guidance: 'Write at least 2–3 paragraphs. Identify each problem clearly and explain why it is dangerous or unfair. Use specific details from the text.'
  },
  {
    id: 'W2',
    type: 'Evidence-Based Response',
    prompt: 'The author ends the story by saying "Without them, the world would be a different place." Using details from the beginning, middle, and end of the story, explain what the author means and why you agree or disagree with this statement. Support your answer with at least two specific details from the text.',
    guidance: 'Include at least 2–3 specific details or events from the story as evidence. Organize your response with a clear beginning, middle, and end.'
  },
  {
    id: 'W3',
    type: 'Argument / Opinion',
    prompt: 'The author of "A World Without Rules" argues that government, laws, and public services are necessary for a safe and fair society. Do you agree or disagree? Use at least TWO specific details from the story to support your opinion.',
    guidance: 'State your opinion clearly at the beginning. Support it with at least 2 specific details from the story. What would life look like without government? Use the evidence.'
  }
];

/* ── SHEET HELPERS ───────────────────────────────────── */
function sessionId(section) {
  return SESSION_ID + '-' + section + '-A1';
}

function submitScorePartial() {
  const total = app.maxScore || app.currentBank.length;
  const pct   = total ? Math.round((app.score / total) * 100) : 0;
  fetch(SHEET_URL, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action:   'submit',
      game:     'wwrt_' + (app.currentSection || 'x'),
      sessionId: sessionId(app.currentSection),
      name:     app.studentName || 'Unknown',
      section:  app.currentSection || '?',
      score:    app.score,
      total,
      percent:  pct,
      status:   `In Progress (Q${app.currentIndex + 1}/${app.currentBank.length})`,
      done:           false,
      elapsed:        app.timerSeconds,
      wrongQuestions: (app.missedQuestions||[]).map(m=>`[${m.id}] ${m.q}`).join(' | '),
      timestamp:      new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    })
  }).catch(() => {});
}

function submitScoreFinal() {
  const total = app.maxScore || app.currentBank.length;
  const pct   = total ? Math.round((app.score / total) * 100) : 0;
  fetch(SHEET_URL, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action:   'submit',
      game:     'wwrt_' + (app.currentSection || 'x'),
      sessionId: sessionId(app.currentSection),
      name:     app.studentName || 'Unknown',
      section:  app.currentSection || '?',
      attempt:  1,
      score:    app.score,
      total,
      percent:  pct,
      status:   'Complete',
      done:           true,
      elapsed:        app.timerSeconds,
      wrongQuestions: (app.missedQuestions||[]).map(m=>`[${m.id}] ${m.q}`).join(' | '),
      timestamp:      new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    })
  }).catch(() => {});
}

function submitWrittenToSheet(w1, w2, w3, elapsedSeconds) {
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const elapsedStr = `${mins}m ${secs}s`;
  fetch(SHEET_URL, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action:    'written',
      game:      'wwrt_comp_written',
      sessionId: sessionId('comp') + '-written',
      name:      app.studentName || 'Unknown',
      w1, w2, w3,
      elapsed:   elapsedStr,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    })
  }).catch(() => {});
}

/* ── ROSTER ─────────────────────────────────────────── */
/* PREVIEW VERSION — all real student data removed.
   Only Mr. O is real (PIN 1234). The 10 names below are fictional
   placeholders so the dropdown looks realistic in the demo. */
const ROSTER = [
  { name: 'Mr. O (Teacher)',   id: '1234' },
  { name: 'Anderson, Emma',    id: '0001' },
  { name: 'Bennett, Liam',     id: '0002' },
  { name: 'Carter, Olivia',    id: '0003' },
  { name: 'Diaz, Noah',        id: '0004' },
  { name: 'Evans, Ava',        id: '0005' },
  { name: 'Foster, Mason',     id: '0006' },
  { name: 'Garcia, Sophia',    id: '0007' },
  { name: 'Hughes, Ethan',     id: '0008' },
  { name: 'Ito, Mia',          id: '0009' },
  { name: 'Jackson, Lucas',    id: '0010' }
];

const GUEST_SLOTS = {
  '937701': 'Guest 1', '937702': 'Guest 2', '937703': 'Guest 3',
  '937704': 'Guest 4', '937705': 'Guest 5', '937706': 'Guest 6',
  '937707': 'Guest 7', '937708': 'Guest 8', '937709': 'Guest 9',
  '937710': 'Guest 10'
};

const SECTION_LABELS = {
  vocab:   'Vocabulary',
  comp:    'Comprehension',
  written: 'Written Response',
  cloze:   'Cloze'
};

/* ── BUILD DROPDOWN ─────────────────────────────────── */
(function buildRoster() {
  const sel = document.getElementById('name-select');
  ROSTER.forEach(s => {
    const o = document.createElement('option');
    o.value = s.name; o.textContent = s.name;
    sel.appendChild(o);
  });
  const div = document.createElement('option');
  div.disabled = true; div.textContent = '── Guest Slots ──';
  sel.appendChild(div);
  Object.entries(GUEST_SLOTS).forEach(([code, label]) => {
    const o = document.createElement('option');
    o.value = `GUEST:${code}`; o.textContent = `🙋 ${label}`;
    sel.appendChild(o);
  });
})();

/* ── SEQUENCE HELPERS ────────────────────────────────── */
function getCompletedSections(name) {
  const scores = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
  const completed = new Set(scores.filter(s => s.name === name && s.done).map(s => s.section));
  if (getWrittenSubmitted(name)) completed.add('written');
  return completed;
}

function getNextSection(name) {
  const completed = getCompletedSections(name);
  return SECTION_SEQUENCE.find(s => !completed.has(s)) || null;
}

function getWrittenSubmitted(name) {
  const written = JSON.parse(localStorage.getItem(WRITTEN_KEY) || '[]');
  return written.some(w => w.name === name);
}

const STEP_META = [
  { key: 'vocab',   label: '📚 Vocabulary',          sub: '24 questions' },
  { key: 'comp',    label: '📖 Comprehension',        sub: '24 questions — scored out of 25' },
  { key: 'written', label: '✍️ Written Response',     sub: '3 open-ended prompts (not scored)' },
  { key: 'cloze',   label: '✏️ Cloze (Fill-in)',      sub: '24 questions' }
];

function renderTestSequence(name) {
  const completed = getCompletedSections(name);
  const next      = getNextSection(name);
  const allDone   = !next;

  const container = document.getElementById('test-sequence');
  if (!container) return;

  container.innerHTML = STEP_META.map((step, i) => {
    const done    = completed.has(step.key);
    const current = step.key === next;
    const bg      = done ? '#d4edda' : current ? '#eaf2ff' : '#f5f5f5';
    const border  = done ? '#28a745' : current  ? '#a9c4f5' : '#e0e0e0';
    const color   = done ? '#155724' : current  ? 'var(--primary)' : '#aaa';
    const icon    = done ? '✅' : current ? '▶' : (i + 1);
    const subText = done ? 'Complete' : step.sub;
    const upNext  = current
      ? '<span style="font-size:0.72rem;font-weight:bold;background:var(--primary);color:white;border-radius:6px;padding:3px 10px;white-space:nowrap;">UP NEXT</span>'
      : '';
    return `<div style="display:flex;align-items:center;gap:14px;background:${bg};border:2px solid ${border};border-radius:12px;padding:11px 15px;margin-bottom:8px;">
      <div style="font-size:1.3rem;min-width:28px;text-align:center;color:${color};">${icon}</div>
      <div style="flex:1;">
        <div style="font-weight:bold;color:${color};font-size:var(--fs);">${step.label}</div>
        <div style="font-size:0.77rem;color:${done?'#388e3c':current?'#555':'#bbb'};margin-top:2px;">${subText}</div>
      </div>
      ${upNext}
    </div>`;
  }).join('');

  const btn = document.getElementById('btn-start-next');
  if (!btn) return;
  if (allDone) {
    btn.textContent = '🎉 All sections complete!';
    btn.disabled    = true;
    btn.style.background = '#7f8c8d';
    btn.style.boxShadow  = '0 5px 0 #566573';
    btn.style.cursor     = 'default';
  } else {
    const meta = STEP_META.find(s => s.key === next);
    btn.textContent     = `▶ Start — ${meta.label}`;
    btn.disabled        = false;
    btn.style.background = '';
    btn.style.boxShadow  = '';
    btn.style.cursor     = 'pointer';
  }
}

/* ── GENERAL HELPERS ─────────────────────────────────── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function getFirstName(name) {
  if (!name) return 'Student';
  const parts = name.split(',');
  return parts.length > 1 ? parts[1].trim().split(' ')[0] : name.split(' ')[0];
}

function computeMaxScore(bank) {
  return bank.reduce((sum, q) => sum + (Array.isArray(q.answer) ? q.answer.length : 1), 0);
}

function wrapWords(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  let idx = 0;
  function walk(node) {
    if (node.nodeType === 3) {
      const text = node.textContent.replace(/—/g, ' — ').replace(/  +/g, ' ');
      const frag = document.createDocumentFragment();
      text.split(/(\s+)/).forEach(part => {
        if (/\S/.test(part)) {
          const sp = document.createElement('span');
          sp.className = 'wrd'; sp.dataset.wi = idx++; sp.textContent = part;
          frag.appendChild(sp);
        } else if (part) {
          frag.appendChild(document.createTextNode(part));
        }
      });
      node.parentNode.replaceChild(frag, node);
    } else {
      [...node.childNodes].forEach(walk);
    }
  }
  walk(tmp);
  return tmp.innerHTML;
}

function choiceHtml(text) { return text.replace(/—/g, ' — '); }

function letterGradeStudent(pct) {
  if (pct >= 97) return 'A+';
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A-';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B-';
  if (pct >= 77) return 'C+';
  if (pct >= 73) return 'C';
  if (pct >= 70) return 'C-';
  if (pct >= 67) return 'D+';
  if (pct >= 63) return 'D';
  if (pct >= 60) return 'D-';
  return 'F';
}

/* ── SPEECH ─────────────────────────────────────────── */
let activeSpeakBtn   = null;
let tabSwitchCount   = 0;
let reviewMode       = false;
let reviewAutoRun    = false;
let pinModalCallback = null;

function stopActiveSpeech() {
  window.speechSynthesis.cancel();
  document.querySelectorAll('.wrd.hl').forEach(e => e.classList.remove('hl'));
  if (activeSpeakBtn) { activeSpeakBtn.textContent = '🔊'; activeSpeakBtn = null; }
}

function speakWrittenPrompt(btn, promptId) {
  if (activeSpeakBtn === btn) { stopActiveSpeech(); return; }
  stopActiveSpeech();
  const p = document.getElementById('prompt-text-' + promptId);
  if (!p) return;
  if (!p.querySelector('.wrd')) p.innerHTML = wrapWords(p.innerHTML);
  const spans = Array.from(p.querySelectorAll('.wrd'));
  if (!spans.length) return;
  activeSpeakBtn = btn; btn.textContent = '⏹';
  const u = new SpeechSynthesisUtterance(spans.map(s => s.textContent).join(' '));
  u.lang = 'en-US'; u.rate = 0.92; let hlIdx = 0;
  u.onboundary = e => {
    if (e.name !== 'word') return;
    p.querySelectorAll('.wrd.hl').forEach(el => el.classList.remove('hl'));
    if (spans[hlIdx]) spans[hlIdx].classList.add('hl');
    hlIdx++;
  };
  u.onend = () => {
    p.querySelectorAll('.wrd.hl').forEach(el => el.classList.remove('hl'));
    if (activeSpeakBtn === btn) { btn.textContent = '🔊'; activeSpeakBtn = null; }
  };
  window.speechSynthesis.speak(u);
}

function speakDir(btn) {
  if (activeSpeakBtn === btn) { stopActiveSpeech(); return; }
  stopActiveSpeech();
  const p = btn.closest('.dir-section').querySelector('.dir-text');
  if (!p) return;
  if (!p.querySelector('.wrd')) p.innerHTML = wrapWords(p.innerHTML);
  const spans = Array.from(p.querySelectorAll('.wrd'));
  if (!spans.length) return;
  activeSpeakBtn = btn; btn.textContent = '⏹';
  const u = new SpeechSynthesisUtterance(spans.map(s => s.textContent).join(' '));
  u.lang = 'en-US'; u.rate = 0.92; let hlIdx = 0;
  u.onboundary = e => {
    if (e.name !== 'word') return;
    document.querySelectorAll('.dir-text .wrd.hl').forEach(el => el.classList.remove('hl'));
    if (spans[hlIdx]) spans[hlIdx].classList.add('hl');
    hlIdx++;
  };
  u.onend = () => {
    document.querySelectorAll('.dir-text .wrd.hl').forEach(el => el.classList.remove('hl'));
    if (activeSpeakBtn === btn) { btn.textContent = '🔊'; activeSpeakBtn = null; }
  };
  window.speechSynthesis.speak(u);
}

/* ══════════════════════════════════════════════════════
   APP OBJECT
══════════════════════════════════════════════════════ */
const app = {

  studentName:      '',
  currentSection:   '',
  currentBank:      [],
  currentIndex:     0,
  score:            0,
  maxScore:         0,
  missedQuestions:  [],
  selectedIndices:  new Set(),
  questionLocked:   false,
  timerSeconds:     0,
  timerInterval:    null,
  timerOn:          false,
  instructInterval: null,
  readInterval:     null,
  writtenTimerSeconds: 0,
  writtenTimerInterval: null,
  _autosaveDraftTimer: null,
  _lastFinishedScore: null,

  show(id) {
    ['start-screen','readaloud-screen','directions-screen','quiz-screen',
     'confirm-submit-screen','end-screen','written-screen','scoreboard-screen']
      .forEach(s => document.getElementById(s).classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    window.speechSynthesis.cancel();
  },

  init() {
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.remove('hidden');
    document.getElementById('student-login-panel').classList.add('hidden');
  },

  /* ── WELCOME / DIRECTIONS ── */
  showReadAloudIntro() {
    document.getElementById('welcome-panel').classList.add('hidden');
    this.show('readaloud-screen');
    const btn = document.getElementById('readaloud-btn');
    const fill = document.getElementById('readaloud-fill');
    const count = document.getElementById('readaloud-count');
    btn.disabled = true; btn.style.opacity = '0.45'; btn.style.cursor = 'not-allowed';
    count.textContent = 6; fill.style.transition = 'none'; fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = 'width 6s linear'; fill.style.width = '0%';
    }));
    let remaining = 6;
    const iv = setInterval(() => {
      remaining--; count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(iv); btn.disabled = false; btn.style.opacity = '1';
        btn.style.cursor = 'pointer'; btn.textContent = "✅ Got It — Show Me the Directions!";
      }
    }, 1000);
  },

  showDirections() {
    this.show('directions-screen');
    this.startInstructionsTimer();
  },

  showLogin() {
    if (this.instructInterval) { clearInterval(this.instructInterval); this.instructInterval = null; }
    window.speechSynthesis.cancel();
    document.querySelectorAll('.dir-text .wrd.hl').forEach(e => e.classList.remove('hl'));
    this.studentName = '';
    document.getElementById('resume-container').classList.add('hidden');
    document.getElementById('section-select').classList.add('hidden');
    const lc = document.getElementById('login-step-card');
    if (lc) lc.classList.remove('hidden');
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.add('hidden');
    document.getElementById('student-login-panel').classList.remove('hidden');
  },

  /* ── NAME SELECT / LOGIN ── */
  onNameSelect() {
    const val = document.getElementById('name-select').value;
    const pinSec = document.getElementById('pin-section');
    const guestSec = document.getElementById('guest-name-section');
    document.getElementById('login-error').textContent = '';
    if (!val) { pinSec.classList.add('hidden'); return; }
    pinSec.classList.remove('hidden');
    if (val.startsWith('GUEST:')) {
      guestSec.classList.remove('hidden');
      document.getElementById('pin-label').textContent = '🔒 Enter guest code:';
    } else {
      guestSec.classList.add('hidden');
      document.getElementById('pin-label').textContent = '🔒 Enter your student number:';
    }
    setTimeout(() => document.getElementById('student-pin').focus(), 80);
  },

  attemptLogin() {
    const selVal = document.getElementById('name-select').value;
    const pin    = document.getElementById('student-pin').value.trim();
    const errEl  = document.getElementById('login-error');
    errEl.textContent = '';
    if (!selVal) { errEl.textContent = '⚠️ Please select your name.'; return; }
    if (!pin)    { errEl.textContent = '⚠️ Please enter your student number.'; return; }

    let matched = false, displayName = '';

    if (selVal.startsWith('GUEST:')) {
      const code = selVal.replace('GUEST:', '');
      if (pin === code) {
        const firstName = (document.getElementById('guest-display-name').value || '').trim();
        if (!firstName) { errEl.textContent = '⚠️ Please enter your first name.'; return; }
        matched = true; displayName = firstName + ' (Guest)';
      } else { errEl.textContent = '❌ Incorrect guest code. Try again.'; return; }
    } else {
      const student = ROSTER.find(s => s.name === selVal);
      if (student && student.id === pin) { matched = true; displayName = selVal; }
      else { errEl.textContent = '❌ Incorrect student number. Try again.'; return; }
    }

    if (matched) {
      this.studentName = displayName;
      document.getElementById('student-pin').value = '';
      document.getElementById('login-error').textContent = '';
      const lc = document.getElementById('login-step-card');
      if (lc) lc.classList.add('hidden');
      document.getElementById('section-select').classList.remove('hidden');
      renderTestSequence(displayName);
      this.checkResume();
    }
  },

  /* ── SEQUENTIAL SECTION START ── */
  startNextSection() {
    if (!this.studentName) return;
    const next = getNextSection(this.studentName);
    if (!next) return;
    if (next === 'written') {
      this.showWrittenScreen();
    } else {
      this.startSession(next);
    }
  },

  unlockSection(section) {
    this.showPinModal(
      `🔓 Unlock ${SECTION_LABELS[section]}`,
      `Enter Teacher PIN to allow ${getFirstName(this.studentName)} to retake ${SECTION_LABELS[section]}.`,
      () => {
        const scores = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
        const updated = scores.filter(s => !(s.name === this.studentName && s.section === section));
        localStorage.setItem(SCORES_KEY, JSON.stringify(updated));
        if (section === 'written') {
          const written = JSON.parse(localStorage.getItem(WRITTEN_KEY) || '[]');
          localStorage.setItem(WRITTEN_KEY, JSON.stringify(written.filter(w => w.name !== this.studentName)));
        }
        renderTestSequence(this.studentName);
      }
    );
  },

  /* ── CONTINUE AFTER A SECTION ── */
  continueToNextSection() {
    stopConfetti();
    const next = getNextSection(this.studentName);
    if (!next) { this.restart(); return; }
    this.timerSeconds = 0;
    if (next === 'written') {
      this.showWrittenScreen();
    } else {
      this.startSession(next);
    }
  },

  /* ── TEACHER REVIEW MODE ── */
  promptTeacherReview() {
    const pin = prompt('Enter Teacher PIN to access Review Mode:');
    if (pin !== '9377') { if (pin !== null) alert('Incorrect PIN.'); return; }
    this.studentName = 'Mr. O (Teacher)';
    reviewMode = true;
    localStorage.removeItem(STORAGE_KEY);
    this._showReviewPicker();
  },

  _showReviewPicker() {
    const section = prompt('Choose a part to preview:\n1 — Vocabulary\n2 — Comprehension\n3 — Written Response\n4 — Cloze\n\nEnter 1, 2, 3, or 4:');
    const map = { '1': 'vocab', '2': 'comp', '3': 'written', '4': 'cloze' };
    if (!map[section]) { alert('Invalid choice.'); reviewMode = false; return; }
    if (map[section] === 'written') {
      this._lastFinishedScore = { score: 23, total: 25, pct: 92 };
      this.currentSection = 'comp';
      this.showWrittenScreen();
      return;
    }
    const mode = prompt('Mode:\n1 — Manual (tap Next)\n2 — Auto-run\n\nEnter 1 or 2:');
    if (mode !== '1' && mode !== '2') { alert('Invalid.'); reviewMode = false; return; }
    reviewAutoRun = (mode === '2');
    this.startSession(map[section]);
  },

  exitReviewMode() {
    reviewMode = false; reviewAutoRun = false;
    this.stopTimerEngine();
    document.getElementById('review-mode-banner').classList.add('hidden');
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.remove('hidden');
    document.getElementById('student-login-panel').classList.add('hidden');
  },

  _autoAnswer() {
    const q = this.currentBank[this.currentIndex];
    const isMulti = Array.isArray(q.answer);
    const answers = isMulti ? q.answer : [q.answer];
    document.querySelectorAll('.answer-btn').forEach((btn, i) => {
      if (answers.includes(i)) { this.selectedIndices.add(i); btn.classList.add('selected'); }
    });
    setTimeout(() => this.confirmAnswer(), 600);
  },

  /* ── START SESSION ── */
  startSession(section) {
    document.getElementById('tab-warning-banner').classList.add('hidden');
    const banner = document.getElementById('review-mode-banner');
    banner.classList.toggle('hidden', !reviewMode);
    if (reviewMode) {
      banner.querySelector('span').textContent = reviewAutoRun
        ? '🔍 Teacher Review Mode — auto-run'
        : '🔍 Teacher Review Mode — tap Next to advance';
    }

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(WWRT_SESSION_ID_KEY);
    this.currentSection = section;
    this.score          = 0;
    this.currentIndex   = 0;
    this.timerSeconds   = 0;
    this.missedQuestions = [];
    this._lastFinishedScore = null;

    let rawBank;
    if (section === 'vocab')     rawBank = [...window.VOCAB_BANK];
    else if (section === 'comp') rawBank = [...window.COMP_BANK];
    else                         rawBank = [...window.CLOZE_BANK];

    const shuffleQ = q => {
      const isMulti = Array.isArray(q.answer);
      const indexed = q.choices.map((text, i) => ({ text, origIdx: i }));
      shuffle(indexed);
      const newAnswer = isMulti
        ? q.answer.map(a => indexed.findIndex(c => c.origIdx === a))
        : indexed.findIndex(c => c.origIdx === q.answer);
      return { id: q.id, q: q.q, choices: indexed.map(c => c.text), answer: newAnswer };
    };

    if (section === 'comp') {
      const details = rawBank.filter(q => /^P(0[1-9]|1[0-2])$/.test(q.id));
      const pairIds = [
        ['P13','P14'], ['P15','P16'], ['P17','P18'],
        ['P19','P20'], ['P21','P22'], ['P23','P24']
      ];
      const pairs = pairIds.map(([a,b]) => [
        rawBank.find(q => q.id === a), rawBank.find(q => q.id === b)
      ]).filter(p => p[0] && p[1]);
      shuffle(details); shuffle(pairs);
      const flatPairs = pairs.flatMap(([inf, ev]) => {
        const infQ = shuffleQ(inf);
        const evQ  = shuffleQ(ev);
        evQ.pairLabel = "(Refers to the inference question above it)";
        return [infQ, evQ];
      });
      this.currentBank = [...details.map(shuffleQ), ...flatPairs];
    } else {
      this.currentBank = rawBank.map(shuffleQ);
      shuffle(this.currentBank);
    }

    this.maxScore = computeMaxScore(this.currentBank);
    this.show('quiz-screen');
    this.startTimer();
    this.renderQuestion();
  },

  /* ── RESUME / SAVE ── */
  checkResume() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const rc = document.getElementById('resume-container');
    const ss = document.getElementById('section-select');
    if (saved && rc) {
      const data = JSON.parse(saved);
      if (this.studentName && data.studentName === this.studentName) {
        rc.classList.remove('hidden');
        document.getElementById('resume-detail').textContent =
          `${SECTION_LABELS[data.currentSection]} — Q${data.currentIndex + 1} of ${data.currentBank.length}`;
        if (ss) ss.classList.add('hidden');
      } else {
        rc.classList.add('hidden');
        if (ss && this.studentName) ss.classList.remove('hidden');
      }
    } else if (rc) {
      rc.classList.add('hidden');
      if (ss && this.studentName) ss.classList.remove('hidden');
    }
  },

  resumeSession() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return;
    this.studentName    = saved.studentName;
    this.currentSection = saved.currentSection;
    this.currentBank    = saved.currentBank;
    this.currentIndex   = saved.currentIndex;
    this.score          = saved.score;
    this.maxScore       = saved.maxScore || computeMaxScore(saved.currentBank);
    this.timerSeconds   = saved.timerSeconds || 0;
    this.show('quiz-screen');
    this.startTimer();
    this.renderQuestion();
  },

  saveProgress() {
    if (reviewMode) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      studentName:    this.studentName,
      currentSection: this.currentSection,
      currentBank:    this.currentBank,
      currentIndex:   this.currentIndex,
      score:          this.score,
      maxScore:       this.maxScore,
      timerSeconds:   this.timerSeconds
    }));
  },

  discardProgress() {
    this.showPinModal(
      '🗑️ Discard Progress',
      'Enter Teacher PIN to clear the in-progress session.',
      () => {
        localStorage.removeItem(STORAGE_KEY);
        document.getElementById('resume-container').classList.add('hidden');
        renderTestSequence(this.studentName);
        this.checkResume();
      }
    );
  },

  /* ── TIMER ── */
  startTimer() {
    this.stopTimerEngine();
    this.timerOn = true;
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this._tickTimer();
      if (this.timerSeconds % 30 === 0) this.saveProgress();
    }, 1000);
  },

  stopTimerEngine() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    this.timerOn = false;
  },

  _tickTimer() {
    const m = String(Math.floor(this.timerSeconds / 60)).padStart(2, '0');
    const s = String(this.timerSeconds % 60).padStart(2, '0');
    const el = document.getElementById('timer-display');
    if (el) el.textContent = `${m}:${s}`;
  },

  startInstructionsTimer() {
    if (this.instructInterval) { clearInterval(this.instructInterval); this.instructInterval = null; }
    const btn   = document.getElementById('ready-btn');
    const fill  = document.getElementById('instruct-fill');
    const count = document.getElementById('instruct-count');
    if (!btn) return;
    if (reviewMode) {
      btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer';
      btn.textContent = "✅ I'm Ready — Let's Begin!"; return;
    }
    btn.disabled = true; btn.style.opacity = '0.45'; btn.style.cursor = 'not-allowed';
    if (count) count.textContent = INSTRUCT_SECS;
    if (fill) {
      fill.style.transition = 'none'; fill.style.width = '100%';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fill.style.transition = `width ${INSTRUCT_SECS}s linear`; fill.style.width = '0%';
      }));
    }
    let remaining = INSTRUCT_SECS;
    this.instructInterval = setInterval(() => {
      remaining--;
      if (count) count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(this.instructInterval); this.instructInterval = null;
        btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer';
        btn.textContent = "✅ I'm Ready — Let's Begin!";
      }
    }, 1000);
  },

  /* ── READ LOCK (12s) ── */
  startReadTimer() {
    if (this.readInterval) { clearInterval(this.readInterval); this.readInterval = null; }
    const bar   = document.getElementById('reading-timer-bar');
    const fill  = document.getElementById('reading-fill');
    const count = document.getElementById('reading-count');

    if (reviewMode) {
      bar.classList.add('hidden');
      document.querySelectorAll('.answer-btn').forEach(b => { b.classList.remove('locked-choice'); b.disabled = false; });
      setTimeout(() => this._autoAnswer(), 300);
      return;
    }

    bar.classList.remove('hidden');
    count.textContent = READ_SECS;
    fill.style.transition = 'none'; fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = `width ${READ_SECS}s linear`; fill.style.width = '0%';
    }));
    document.querySelectorAll('.answer-btn').forEach(b => { b.classList.add('locked-choice'); b.disabled = true; });

    this.readRemaining = READ_SECS;
    this.readInterval = setInterval(() => {
      this.readRemaining--; count.textContent = this.readRemaining;
      if (this.readRemaining <= 0) {
        clearInterval(this.readInterval); this.readInterval = null;
        this.readRemaining = 0;
        bar.classList.add('hidden');
        document.querySelectorAll('.answer-btn').forEach(b => { b.classList.remove('locked-choice'); b.disabled = false; });
        document.getElementById('confirm-btn').classList.remove('hidden');
      }
    }, 1000);
  },

  /* ── RENDER QUESTION ── */
  renderQuestion() {
    const q      = this.currentBank[this.currentIndex];
    const total  = this.currentBank.length;
    const isMulti = Array.isArray(q.answer);
    const isLast  = this.currentIndex === total - 1;

    document.getElementById('progress-text').textContent = `Question ${this.currentIndex + 1} of ${total}`;
    document.getElementById('name-badge').textContent    = getFirstName(this.studentName);
    document.getElementById('progress-fill').style.width = `${(this.currentIndex / total) * 100}%`;

    const qtEl  = document.getElementById('question-text');
    const badge = isMulti ? '<span class="two-answer-badge">Choose TWO</span>' : '';
    const pairNote = q.pairLabel
      ? `<div style="font-size:0.78rem;color:#7f8c8d;margin-top:6px;font-style:italic;">📎 ${q.pairLabel}</div>`
      : '';
    qtEl.innerHTML = wrapWords(q.q) + badge + pairNote;

    document.getElementById('confirm-btn').classList.add('hidden');
    const nextBtn = document.getElementById('next-btn');
    nextBtn.classList.add('hidden');
    nextBtn.textContent = isLast ? '✅ Submit My Answers' : 'Next ➡️';

    this.selectedIndices = new Set();
    this.questionLocked  = false;
    const wrap = document.getElementById('answers');
    wrap.innerHTML = '';

    q.choices.forEach((text, i) => {
      const row = document.createElement('div');
      row.className = 'answer-row';

      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.innerHTML = `<strong>${['A','B','C','D','E'][i]}.</strong>&nbsp;<span class="choice-text">${choiceHtml(text)}</span>`;
      btn.onclick = () => this._selectChoice(i, btn, isMulti);

      const speakBtn = document.createElement('button');
      speakBtn.className = 'choice-speak-btn';
      speakBtn.textContent = '🔊';
      speakBtn.title = 'Read this choice aloud';
      speakBtn.onclick = e => {
        e.stopPropagation();
        if (activeSpeakBtn === speakBtn) { stopActiveSpeech(); return; }
        stopActiveSpeech();
        const textSpan = btn.querySelector('.choice-text');
        if (textSpan && !textSpan.querySelector('.wrd')) textSpan.innerHTML = wrapWords(textSpan.innerHTML);
        const spans = textSpan ? Array.from(textSpan.querySelectorAll('.wrd')) : [];
        activeSpeakBtn = speakBtn; speakBtn.textContent = '⏹';
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US'; u.rate = 0.9; let hlIdx = 0;
        u.onboundary = ev => {
          if (ev.name !== 'word') return;
          textSpan.querySelectorAll('.wrd.hl').forEach(el => el.classList.remove('hl'));
          if (spans[hlIdx]) spans[hlIdx].classList.add('hl');
          hlIdx++;
        };
        u.onend = () => {
          if (textSpan) textSpan.querySelectorAll('.wrd.hl').forEach(el => el.classList.remove('hl'));
          if (activeSpeakBtn === speakBtn) { speakBtn.textContent = '🔊'; activeSpeakBtn = null; }
        };
        window.speechSynthesis.speak(u);
      };

      row.appendChild(speakBtn);
      row.appendChild(btn);
      wrap.appendChild(row);
    });

    if (this.currentIndex > 0 && this.currentIndex % 5 === 0) submitScorePartial();
    this.saveProgress();
    document.getElementById('answers').classList.remove('hidden');
    this.startReadTimer();
  },

  _selectChoice(i, btn, isMulti) {
    if (this.questionLocked) return;
    if (isMulti) {
      if (this.selectedIndices.has(i)) { this.selectedIndices.delete(i); btn.classList.remove('selected'); }
      else { this.selectedIndices.add(i); btn.classList.add('selected'); }
    } else {
      document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
      this.selectedIndices = new Set([i]);
      btn.classList.add('selected');
    }
  },

  /* ── CONFIRM ANSWER (no feedback in test mode) ── */
  confirmAnswer() {
    if (this.selectedIndices.size === 0) return;
    this.questionLocked = true;

    const q = this.currentBank[this.currentIndex];
    const isMulti = Array.isArray(q.answer);

    if (isMulti) {
      this.score += [...this.selectedIndices].filter(i => q.answer.includes(i)).length;
      const allCorrect = q.answer.every(i => this.selectedIndices.has(i)) && [...this.selectedIndices].every(i => q.answer.includes(i));
      if (!allCorrect) this.missedQuestions.push({ id: q.id, q: q.q });
    } else {
      if ([...this.selectedIndices][0] === q.answer) this.score++;
      else this.missedQuestions.push({ id: q.id, q: q.q });
    }

    document.querySelectorAll('.answer-btn').forEach((btn, i) => {
      btn.disabled = true;
      if (reviewMode) {
        const isCorrect = isMulti ? q.answer.includes(i) : i === q.answer;
        if (isCorrect)                        btn.classList.add('correct');
        else if (this.selectedIndices.has(i)) btn.classList.add('incorrect');
      }
    });

    document.getElementById('confirm-btn').classList.add('hidden');
    this.saveProgress();

    if (reviewMode && reviewAutoRun) {
      setTimeout(() => this.nextQuestion(), 800);
    } else {
      document.getElementById('next-btn').classList.remove('hidden');
    }
  },

  nextQuestion() {
    stopActiveSpeech();
    if (this.currentIndex + 1 >= this.currentBank.length) {
      this._finishSession();
    } else {
      this.currentIndex++;
      this.renderQuestion();
    }
  },

  /* ── CONFIRM SUBMIT ── */
  showConfirmSubmit() {
    stopActiveSpeech();
    if (this.readInterval) { clearInterval(this.readInterval); this.readInterval = null; }
    const total = this.currentBank.length;
    document.getElementById('confirm-submit-msg').innerHTML =
      `You've answered all <strong>${total} questions</strong> in the <strong>${SECTION_LABELS[this.currentSection]}</strong> section.<br><br>Are you ready to submit your test?`;
    this.show('confirm-submit-screen');
  },

  goBackFromConfirm() {
    this.show('quiz-screen');
    this._renderLockedQuestion();
  },

  _renderLockedQuestion() {
    const q     = this.currentBank[this.currentIndex];
    const total = this.currentBank.length;
    const isMulti = Array.isArray(q.answer);

    document.getElementById('progress-text').textContent  = `Question ${this.currentIndex + 1} of ${total}`;
    document.getElementById('name-badge').textContent     = getFirstName(this.studentName);
    document.getElementById('progress-fill').style.width  = `${((this.currentIndex + 1) / total) * 100}%`;
    document.getElementById('reading-timer-bar').classList.add('hidden');

    const qtEl  = document.getElementById('question-text');
    const badge = isMulti ? '<span class="two-answer-badge">Choose TWO</span>' : '';
    const pairNote = q.pairLabel
      ? `<div style="font-size:0.78rem;color:#7f8c8d;margin-top:6px;font-style:italic;">📎 ${q.pairLabel}</div>`
      : '';
    qtEl.innerHTML = wrapWords(q.q) + badge + pairNote;

    document.getElementById('confirm-btn').classList.add('hidden');
    const nextBtn = document.getElementById('next-btn');
    nextBtn.textContent = 'Review & Submit ➡️';
    nextBtn.classList.remove('hidden');

    this.questionLocked = true;
    const wrap = document.getElementById('answers');
    wrap.innerHTML = '';
    q.choices.forEach((text, i) => {
      const row = document.createElement('div');
      row.className = 'answer-row';
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.innerHTML = `<strong>${['A','B','C','D','E'][i]}.</strong>&nbsp;<span class="choice-text">${choiceHtml(text)}</span>`;
      btn.disabled = true;
      row.appendChild(btn);
      wrap.appendChild(row);
    });
    document.getElementById('answers').classList.remove('hidden');
  },

  /* ── FINISH SESSION ── */
  _finishSession() {
    this.stopTimerEngine();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(WWRT_SESSION_ID_KEY);

    const total = this.maxScore;
    const pct   = Math.round((this.score / total) * 100);
    const date  = new Date();

    this._lastFinishedScore = { score: this.score, total, pct };

    if (!reviewMode) {
      const scores = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
      scores.push({
        name: this.studentName, section: this.currentSection, attempt: 1,
        score: this.score, total, pct, elapsed: this.timerSeconds,
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        done: true
      });
      localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
    }

    submitScoreFinal();

    const letter = letterGradeStudent(pct);
    let msg;
    if (pct === 100)    msg = "⭐ PERFECT SCORE!";
    else if (pct >= 90) msg = "Outstanding Work! 🌟";
    else if (pct >= 80) msg = "Great Job! 👏";
    else if (pct >= 70) msg = "Good Effort! 💪";
    else if (pct >= 60) msg = "Keep Working Hard! 📚";
    else                msg = "Don't give up — let's review! 📚";

    this.show('end-screen');
    document.getElementById('review-next-btn').classList.toggle('hidden', !reviewMode);
    document.getElementById('final-score-sub').textContent =
      `${SECTION_LABELS[this.currentSection]} · ${this.studentName}`;
    document.getElementById('final-msg').textContent = msg;

    const pctEl = document.getElementById('final-percent');
    pctEl.innerHTML =
      `${this.score}/${total}<br><small style="font-size:0.5em;color:${pct>=70?'var(--correct)':'var(--danger)'};">${pct}% · ${letter}</small>`;
    setTimeout(() => pctEl.classList.add('revealed'), 50);

    document.getElementById('written-response-btn-wrap').classList.add('hidden');
    document.getElementById('written-submitted-notice').classList.add('hidden');

    const continueBtnWrap = document.getElementById('continue-btn-wrap');
    const continueBtn     = document.getElementById('continue-btn');
    if (!reviewMode) {
      const next = getNextSection(this.studentName);
      if (next) {
        const meta = STEP_META.find(s => s.key === next);
        continueBtn.textContent = `Continue to ${meta.label} →`;
        continueBtnWrap.classList.remove('hidden');
      } else {
        continueBtn.textContent = '🎉 View My Final Scores';
        continueBtn.onclick = () => this.showScores(true);
        continueBtnWrap.classList.remove('hidden');
      }
    } else {
      continueBtnWrap.classList.add('hidden');
    }

    if (pct >= 90) startConfetti(pct);
  },

  /* ── WRITTEN RESPONSE SCREEN ── */
  showWrittenScreen() {
    this.show('written-screen');

    if (this._lastFinishedScore) {
      const { score, total, pct } = this._lastFinishedScore;
      document.getElementById('mc-score-reminder').innerHTML =
        `📊 Your Comprehension MC score: <strong>${score}/${total} (${pct}%)</strong> — already saved. Written responses are submitted separately and are not scored.`;
    }

    const container = document.getElementById('written-prompts-container');
    container.innerHTML = '';
    container.classList.remove('hidden');

    WRITTEN_PROMPTS.forEach(p => {
      const card = document.createElement('div');
      card.className = 'written-prompt-card';
      card.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="speak-btn" onclick="speakWrittenPrompt(this,'${p.id}')">🔊</button>
          <div class="written-prompt-label">${p.id}</div>
        </div>
        <div class="written-prompt-type">${p.type}</div>
        <div class="written-prompt-text" id="prompt-text-${p.id}">${p.prompt}</div>
        <div class="written-guidance">💡 ${p.guidance}</div>
        <textarea class="written-textarea" id="textarea-${p.id}"
                  placeholder="Write your response here…"
                  oninput="app._updateWordCount('${p.id}', this); app._autosaveDraft()"></textarea>
        <div class="word-count-row">Words: <span class="word-count-val" id="wc-${p.id}">0</span><span style="color:#aaa;font-size:0.8rem;"> / 10 minimum</span></div>`;
      container.appendChild(card);
    });

    const btn = document.getElementById('submit-written-btn');
    btn.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = '✅ Submit Written Responses';
    document.getElementById('written-submit-error').textContent = '';
    document.getElementById('written-success-panel').classList.add('hidden');
    this._restoreDraft();
    this._startWrittenTimer();
  },

  _updateWordCount(id, textarea) {
    const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    const el = document.getElementById(`wc-${id}`);
    if (el) { el.textContent = words; el.style.color = words >= 10 ? '#27ae60' : 'var(--primary, #e74c3c)'; }
  },

  _autosaveDraft() {
    const draft = {};
    for (const p of WRITTEN_PROMPTS) {
      const ta = document.getElementById(`textarea-${p.id}`);
      if (ta) draft[p.id] = ta.value;
    }
    localStorage.setItem('wwrt_written_draft_v1', JSON.stringify({ name: this.studentName, draft }));
    clearTimeout(this._autosaveDraftTimer);
    this._autosaveDraftTimer = setTimeout(() => this._saveDraftToServer(draft), 3000);
  },

  _saveDraftToServer(draft) {
    fetch(SHEET_URL, {
      method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'draft', game: 'wwrt_comp_written',
        name: this.studentName, sessionId: sessionId('comp') + '-written',
        w1: draft.W1 || '', w2: draft.W2 || '', w3: draft.W3 || ''
      })
    }).catch(() => {});
  },

  _restoreDraft() {
    try {
      const saved = JSON.parse(localStorage.getItem('wwrt_written_draft_v1') || 'null');
      if (!saved || saved.name !== this.studentName) return;
      for (const p of WRITTEN_PROMPTS) {
        const ta = document.getElementById(`textarea-${p.id}`);
        if (ta && saved.draft[p.id]) {
          ta.value = saved.draft[p.id];
          this._updateWordCount(p.id, ta);
        }
      }
    } catch(e) {}
  },

  _startWrittenTimer() {
    if (this.writtenTimerInterval) clearInterval(this.writtenTimerInterval);
    this.writtenTimerSeconds = 0;
    this._tickWrittenTimer();
    this.writtenTimerInterval = setInterval(() => {
      this.writtenTimerSeconds++;
      this._tickWrittenTimer();
    }, 1000);
  },

  _tickWrittenTimer() {
    const m = String(Math.floor(this.writtenTimerSeconds / 60)).padStart(2, '0');
    const s = String(this.writtenTimerSeconds % 60).padStart(2, '0');
    const el = document.getElementById('written-timer-display');
    if (el) el.textContent = `${m}:${s}`;
  },

  _stopWrittenTimer() {
    if (this.writtenTimerInterval) { clearInterval(this.writtenTimerInterval); this.writtenTimerInterval = null; }
  },

  submitWrittenResponses() {
    const responses = {};
    for (const p of WRITTEN_PROMPTS) {
      const ta = document.getElementById(`textarea-${p.id}`);
      responses[p.id] = ta ? ta.value.trim() : '';
    }

    const errors = [];
    for (const p of WRITTEN_PROMPTS) {
      const count = (responses[p.id] || '').split(/\s+/).filter(w => w.length > 0).length;
      if (count < 10) errors.push(`${p.id} needs at least 10 words (you have ${count}).`);
    }
    if (errors.length) {
      document.getElementById('written-submit-error').textContent = '⚠️ ' + errors.join('  ');
      return;
    }

    document.getElementById('written-submit-error').textContent = '';
    const btn = document.getElementById('submit-written-btn');
    btn.disabled = true; btn.textContent = '⏳ Submitting…';

    this._stopWrittenTimer();
    submitWrittenToSheet(responses.W1 || '', responses.W2 || '', responses.W3 || '', this.writtenTimerSeconds);

    const written = JSON.parse(localStorage.getItem(WRITTEN_KEY) || '[]');
    written.push({ name: this.studentName, timestamp: new Date().toISOString() });
    localStorage.setItem(WRITTEN_KEY, JSON.stringify(written));
    localStorage.removeItem('wwrt_written_draft_v1');

    document.getElementById('written-prompts-container').classList.add('hidden');
    btn.classList.add('hidden');
    document.getElementById('mc-score-reminder').classList.add('hidden');
    document.getElementById('written-success-panel').classList.remove('hidden');
  },

  /* ── SPEAK QUESTION ── */
  speakQuestion() {
    const qBtn = document.getElementById('speak-q-btn');
    if (activeSpeakBtn === qBtn) { stopActiveSpeech(); return; }
    stopActiveSpeech();
    activeSpeakBtn = qBtn; qBtn.textContent = '⏹';
    const qtEl    = document.getElementById('question-text');
    const qtSpans = Array.from(qtEl.querySelectorAll('.wrd'));
    const qtText  = qtSpans.map(s => s.textContent).join(' ').replace(/_+/g, 'blank');
    let hlIdx = 0;
    const u = new SpeechSynthesisUtterance(qtText);
    u.lang = 'en-US'; u.rate = 0.9;
    u.onboundary = e => {
      if (e.name !== 'word') return;
      document.querySelectorAll('.wrd.hl').forEach(el => el.classList.remove('hl'));
      if (qtSpans[hlIdx]) qtSpans[hlIdx].classList.add('hl');
      hlIdx++;
    };
    u.onend = () => {
      document.querySelectorAll('.wrd.hl').forEach(e => e.classList.remove('hl'));
      const b = document.getElementById('speak-q-btn');
      if (activeSpeakBtn === b) { b.textContent = '🔊'; activeSpeakBtn = null; }
    };
    window.speechSynthesis.speak(u);
  },

  /* ── SCOREBOARD ── */
  showScores(autoShow = false) {
    this.show('scoreboard-screen');
    const teacherBtns = document.getElementById('teacher-score-btns');
    if (teacherBtns) teacherBtns.style.display = this.studentName === 'Mr. O (Teacher)' ? 'flex' : 'none';
    if (!reviewMode) this._startScoreLock(autoShow ? 30 : 0);

    const all    = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    const listEl = document.getElementById('score-list');
    const noEl   = document.getElementById('no-scores-msg');
    if (!all.length) { listEl.innerHTML = ''; noEl.style.display = 'block'; return; }
    noEl.style.display = 'none';

    const writtenDone = getWrittenSubmitted(this.studentName);

    const summaryCards = STEP_META.map(step => {
      if (step.key === 'written') {
        return `<div class="sb-summary-card">
          <div class="sb-summary-label">Written</div>
          <div class="sb-summary-grade" style="color:${writtenDone?'#27ae60':'#aaa'};font-size:1.6rem;">${writtenDone?'✅':'—'}</div>
          <div class="sb-summary-score" style="color:#555;">${writtenDone?'Submitted':'Not yet'}</div>
        </div>`;
      }
      const best = all.filter(s => s.section === step.key && s.done)
        .reduce((b, r) => (!b || r.pct > b.pct) ? r : b, null);
      if (!best) return `<div class="sb-summary-card sb-incomplete">
        <div class="sb-summary-label">${step.label.replace(/^[^\s]+\s/,'')}</div>
        <div class="sb-summary-grade" style="color:#ccc;">—</div>
        <div class="sb-summary-score" style="color:#aaa;">Not yet</div></div>`;
      const grade = letterGradeStudent(best.pct);
      const gc = best.pct>=90?'#27ae60':best.pct>=80?'#2980b9':best.pct>=70?'#f39c12':best.pct>=60?'#e67e22':'#e74c3c';
      return `<div class="sb-summary-card">
        <div class="sb-summary-label">${step.label.replace(/^[^\s]+\s/,'')}</div>
        <div class="sb-summary-grade" style="color:${gc};">${grade}</div>
        <div class="sb-summary-score">${best.score}/${best.total} · ${best.pct}%</div>
      </div>`;
    }).join('');

    const details = ['vocab','comp','cloze'].map(sec => {
      const rows = all.filter(s => s.section === sec && s.done);
      if (!rows.length) return '';
      const tableRows = rows.map(r => {
        const grade = letterGradeStudent(r.pct);
        const cls   = r.pct>=90?'score-good':r.pct>=70?'score-ok':'score-bad';
        return `<tr><td>${r.score}/${r.total}</td>
          <td class="${cls}">${r.pct}%</td>
          <td class="${cls}" style="font-weight:800;">${grade}</td>
          <td>${r.time||'—'}</td><td>${r.date}</td></tr>`;
      }).join('');
      return `<h3 style="color:var(--primary);margin:22px 0 8px;border-bottom:2px solid #e0e0e0;padding-bottom:6px;">${SECTION_LABELS[sec]}</h3>
        <table class="scoreboard-table"><thead><tr><th>Score</th><th>%</th><th>Grade</th><th>Time</th><th>Date</th></tr></thead>
        <tbody>${tableRows}</tbody></table>`;
    }).join('');

    listEl.innerHTML = `
      <div style="margin-bottom:6px;font-size:0.8rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;">Your Test Scores</div>
      <div class="sb-summary-row">${summaryCards}</div>
      <div style="margin-top:24px;">${details}</div>`;
  },

  _startScoreLock(secs) {
    const bar     = document.getElementById('sb-lock-bar');
    const fill    = document.getElementById('sb-lock-fill');
    const count   = document.getElementById('sb-lock-count');
    const buttons = document.querySelectorAll('#scoreboard-screen button:not(#sb-lock-bar button)');
    if (!secs || secs <= 0) { if (bar) bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden'); count.textContent = secs;
    fill.style.transition = 'none'; fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = `width ${secs}s linear`; fill.style.width = '0%';
    }));
    buttons.forEach(b => { b.disabled = true; b.style.opacity = '0.4'; });
    let remaining = secs;
    const iv = setInterval(() => {
      remaining--; count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(iv); bar.classList.add('hidden');
        buttons.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
      }
    }, 1000);
  },

  clearScores() {
    const panel = document.getElementById('clear-confirm-panel');
    panel.classList.remove('hidden');
    document.getElementById('clear-pin-input').value = '';
    document.getElementById('clear-pin-error').textContent = '';
    setTimeout(() => document.getElementById('clear-pin-input').focus(), 80);
  },

  confirmClearScores() {
    const pin = document.getElementById('clear-pin-input').value.trim();
    if (pin === '9377') {
      localStorage.removeItem(SCORES_KEY);
      document.getElementById('clear-confirm-panel').classList.add('hidden');
      this.showScores();
    } else {
      document.getElementById('clear-pin-error').textContent = '❌ Incorrect PIN. Try again.';
      document.getElementById('clear-pin-input').value = '';
      document.getElementById('clear-pin-input').focus();
    }
  },

  cancelClearScores() {
    document.getElementById('clear-confirm-panel').classList.add('hidden');
  },

  /* ── RESTART ── */
  restart() {
    stopConfetti();
    this.stopTimerEngine();
    this.timerSeconds = 0;
    this.studentName  = '';
    document.getElementById('name-select').value = '';
    document.getElementById('student-pin').value = '';
    document.getElementById('pin-section').classList.add('hidden');
    document.getElementById('section-select').classList.add('hidden');
    document.getElementById('resume-container').classList.add('hidden');
    document.getElementById('login-error').textContent = '';
    const lc = document.getElementById('login-step-card');
    if (lc) lc.classList.remove('hidden');
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.remove('hidden');
    document.getElementById('student-login-panel').classList.add('hidden');
  },

  /* ── PIN MODAL ── */
  showPinModal(title, msg, onSuccess) {
    pinModalCallback = onSuccess;
    document.getElementById('pin-modal-title').textContent = title;
    document.getElementById('pin-modal-msg').textContent   = msg;
    document.getElementById('pin-modal-input').value       = '';
    document.getElementById('pin-modal-error').textContent = '';
    document.getElementById('pin-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('pin-modal-input').focus(), 80);
  },

  confirmPinModal() {
    const pin = document.getElementById('pin-modal-input').value.trim();
    if (pin === '9377') {
      document.getElementById('pin-modal').classList.add('hidden');
      const cb = pinModalCallback; pinModalCallback = null;
      if (cb) cb();
    } else {
      document.getElementById('pin-modal-error').textContent = '❌ Incorrect PIN. Try again.';
      document.getElementById('pin-modal-input').value = '';
      document.getElementById('pin-modal-input').focus();
    }
  },

  cancelPinModal() {
    document.getElementById('pin-modal').classList.add('hidden');
    pinModalCallback = null;
  }
};

/* ── VISIBILITY / UNLOAD ─────────────────────────────── */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (app.writtenTimerInterval) {
      app._stopWrittenTimer();
      app._wasWrittenTimerRunning = true;
    }
    if (!app.timerOn) return;
    tabSwitchCount++;
    app.stopTimerEngine();
    app.saveProgress();
    if (app.instructInterval) clearInterval(app.instructInterval);
    if (app.readInterval)     clearInterval(app.readInterval);
    app._wasTimerRunning = true;
  } else {
    if (app._wasWrittenTimerRunning) {
      app._wasWrittenTimerRunning = false;
      app.writtenTimerInterval = setInterval(() => {
        app.writtenTimerSeconds++;
        app._tickWrittenTimer();
      }, 1000);
    }
    if (!app._wasTimerRunning) return;
    app._wasTimerRunning = false;
    const wb = document.getElementById('tab-warning-banner');
    if (wb) wb.classList.remove('hidden');
    app.stopTimerEngine();
    app.timerInterval = setInterval(() => {
      app.timerSeconds++;
      app._tickTimer();
      if (app.timerSeconds % 30 === 0) app.saveProgress();
    }, 1000);
    app.timerOn = true;
  }
});

window.addEventListener('beforeunload', () => {
  if (app.timerOn) app.saveProgress();
});

/* ── CONFETTI ─────────────────────────────────────────── */
const canvas = document.getElementById('confetti-canvas');
const ctx    = canvas.getContext('2d');
let particles = [], animId = null;

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

function startConfetti(pct) {
  particles = [];
  const count = pct === 100 ? 300 : 220;
  const cols  = pct === 100
    ? ['#FFD700','#c9a227','#FFFACD','#FFA500','#ffffff']
    : ['#1a3a6b','#c0392b','#2ecc71','#3498db','#9b59b6','#e74c3c','#FFD700'];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      c: cols[~~(Math.random() * cols.length)],
      s: Math.random() * 5 + 3, d: Math.random() * 5 + 2, r: Math.random() * Math.PI * 2
    });
  }
  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r += 0.05);
    ctx.fillStyle = p.c; ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s);
    ctx.restore();
    p.y += p.d; p.x += Math.sin(p.r) * 1.5;
    if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
  });
  animId = requestAnimationFrame(animateConfetti);
}

function stopConfetti() {
  if (animId) cancelAnimationFrame(animId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  animId = null;
}

/* ── BOOT ─────────────────────────────────────────────── */
app.init();
