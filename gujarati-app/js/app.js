import { UNITS, LESSONS, ALL_ITEMS, ITEMS, LESSON_BY_ID, UNIT_BY_ID, unitPool } from './data.js';
import { PERSONAL } from './personal.js';
import * as store from './store.js';
import { state } from './store.js';
import { initSpeech, playItem, stopAudio, speak, guVoice, ttsSupported, recSupported, Recorder } from './speech.js';
import { runSession, buildLessonSteps, buildDrillSteps } from './lesson.js';
import { esc, shuffle, toast, sfx, norm, ICONS } from './ui.js';
import * as idb from './idb.js';

const app = document.getElementById('app');
const tabbar = document.getElementById('tabbar');
const NAME = PERSONAL.learnerName;
const FROM = PERSONAL.fromName ? PERSONAL.fromName : 'with love';
const FROM_LABEL = PERSONAL.fromName ? `From ${PERSONAL.fromName}` : 'From you ❤️';
const FULLSCREEN = new Set(['lesson', 'review', 'drill', 'welcome']);

// ---------------- helpers ----------------

const lessonIndex = (id) => LESSONS.findIndex((l) => l.id === id);
function lessonStatus(id) {
  if (store.isCompleted(id)) return 'done';
  const i = lessonIndex(id);
  return i === 0 || store.isCompleted(LESSONS[i - 1].id) ? 'current' : 'locked';
}
const nextLesson = () => LESSONS.find((l) => !store.isCompleted(l.id));
const learnedItems = () => store.learnedIds().map((id) => ITEMS[id]).filter(Boolean);
const scriptLine = (it) => (state.settings.showScript && it.gu ? `<span class="gu">${esc(it.gu)}</span>` : '');

function wordOfDay() {
  const d = store.dayStr();
  let h = 0;
  for (const c of d) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return ALL_ITEMS[h % ALL_ITEMS.length];
}

function greetingLine() {
  const h = new Date().getHours();
  if (h < 12) return 'Suprabhaat ☀️ Good morning';
  if (h < 17) return 'Good afternoon 🌼';
  if (h < 21) return 'Good evening 🪔';
  return 'Shubh raatri soon 🌙';
}

function ring(pct, size = 56) {
  const r = size / 2 - 5, c = 2 * Math.PI * r;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}"/>
  </svg>`;
}

// ---------------- screens ----------------

function viewWelcome() {
  app.innerHTML = `
    <section class="screen welcome">
      <div class="welcome-art">🙏</div>
      <h1>Kem cho, ${esc(NAME)}!</h1>
      <p class="gu-sub">કેમ છો, ${esc(PERSONAL.learnerNameGu)}?</p>
      <div class="card letter"><p>${esc(PERSONAL.welcome)}</p><p class="sign">— ${esc(FROM)}</p></div>
      <ul class="tips">
        <li><span>🔊</span> Turn your sound on — tap the speaker on any phrase to hear it.</li>
        <li><span>🎤</span> Record yourself and compare with the real pronunciation.</li>
        <li><span>💌</span> Keep your streak going… there are surprises hidden inside.</li>
      </ul>
      <button class="btn soft" data-test>${ICONS.speaker}<span>Test the Gujarati voice</span></button>
      <button class="btn primary big" data-start>Let's start</button>
    </section>`;
  app.querySelector('[data-test]').onclick = () => speak('કેમ છો? મજામાં!');
  app.querySelector('[data-start]').onclick = () => { state.onboarded = true; store.save(); location.hash = '#/home'; };
}

function viewHome() {
  const s = store.streak();
  const txp = store.todayXp();
  const goal = state.settings.dailyGoal;
  const pct = Math.min(100, Math.round((txp / goal) * 100));
  const next = nextLesson();
  const due = store.dueIds().length;
  const wod = wordOfDay();
  const unlocked = state.notes.length;
  const nextNote = PERSONAL.loveNotes.find((n) => !state.notes.includes(n.id));
  const nextUnit = next && UNIT_BY_ID[next.unitId];

  app.innerHTML = `
    <section class="screen home">
      <header class="hello">
        <div>
          <p class="eyebrow">${greetingLine()}</p>
          <h1>Kem cho, ${esc(NAME)}!</h1>
        </div>
        <a class="icon-btn" href="#/settings" aria-label="Settings">${ICONS.gear}</a>
      </header>

      <div class="stats">
        <div class="stat"><span class="stat-ico">🔥</span><b>${s}</b><small>day streak</small></div>
        <div class="stat"><span class="stat-ico">⭐</span><b>${state.xp}</b><small>total XP</small></div>
        <div class="stat goal">${ring(pct)}<div><b>${txp}/${goal}</b><small>today's goal</small></div></div>
      </div>

      <div id="install-slot"></div>

      ${next ? `
      <a class="card continue" href="#/lesson/${next.id}" style="--u:${nextUnit.color}">
        <span class="continue-emoji">${nextUnit.emoji}</span>
        <div class="grow">
          <p class="eyebrow">${store.learnedIds().length ? 'Up next' : 'Start here'} · Unit ${nextUnit.n}</p>
          <h2>${esc(next.title)}</h2>
          <p class="muted">${esc(nextUnit.title)} · ${next.items.length} phrases · ~4 min</p>
        </div>
        <span class="go">${ICONS.play}</span>
      </a>` : `
      <div class="card continue done-all"><span class="continue-emoji">🏆</span><div><h2>All lessons done!</h2><p class="muted">Amazing, ${esc(NAME)}. Keep your words fresh in Practice.</p></div></div>`}

      ${due ? `
      <a class="card review-cta" href="#/review">
        <span class="continue-emoji">🔁</span>
        <div class="grow"><h3>${due} word${due > 1 ? 's' : ''} to review</h3><p class="muted">A quick review keeps them in your memory</p></div>
        <span class="chev">›</span>
      </a>` : ''}

      <div class="card wod">
        <p class="eyebrow">Word of the day</p>
        <div class="wod-row">
          <div class="grow">
            <h2 class="rom">${esc(wod.rom)}</h2>
            ${scriptLine(wod)}
            <p class="en">${esc(wod.en)}</p>
          </div>
          <button class="play big" data-wod aria-label="Listen">${ICONS.speaker}</button>
        </div>
      </div>

      <a class="card notes-cta" href="#/notes">
        <span class="continue-emoji">💌</span>
        <div class="grow">
          <h3>Notes for you</h3>
          <p class="muted">${unlocked ? `${unlocked} unlocked` : 'Locked'}${nextNote ? ` · next: ${unlockLabel(nextNote.unlock)}` : ' · all unlocked!'}</p>
        </div>
        <span class="chev">›</span>
      </a>
    </section>`;
  app.querySelector('[data-wod]').onclick = () => playItem(wod);
  renderInstallSlot();
}

function unlockLabel(u) {
  const [k, v] = Object.entries(u)[0];
  return { streak: `${v}-day streak`, lessons: `${v} lesson${v > 1 ? 's' : ''}`, words: `${v} words`, xp: `${v} XP` }[k] || '';
}

function viewLearn() {
  app.innerHTML = `
    <section class="screen">
      <h1 class="title">Learn</h1>
      ${UNITS.map((u) => {
        const done = u.lessons.filter((l) => store.isCompleted(l.id)).length;
        return `
        <div class="unit" style="--u:${u.color}">
          <div class="unit-head">
            <span class="unit-emoji">${u.emoji}</span>
            <div class="grow">
              <p class="eyebrow">Unit ${u.n} · ${done}/${u.lessons.length} done</p>
              <h2>${esc(u.title)}</h2>
              <p class="muted">${esc(u.desc)}</p>
            </div>
          </div>
          <p class="unit-tip">💡 ${esc(u.tip)}</p>
          <ol class="path">
            ${u.lessons.map((l) => {
              const st = lessonStatus(l.id);
              return `<li><button class="node ${st}" data-lesson="${l.id}">
                <span class="node-dot">${st === 'done' ? '✓' : st === 'locked' ? '🔒' : '▶'}</span>
                <span class="node-text"><b>${esc(l.title)}</b><small>${l.items.length} phrases${st === 'done' ? ' · tap to replay' : ''}</small></span>
              </button></li>`;
            }).join('')}
          </ol>
        </div>`;
      }).join('')}
    </section>`;
  app.querySelectorAll('[data-lesson]').forEach((b) => {
    b.onclick = () => {
      if (b.classList.contains('locked')) { toast('Finish the lesson before this one first 🙂'); return; }
      location.hash = `#/lesson/${b.dataset.lesson}`;
    };
  });
  app.querySelector('.node.current')?.scrollIntoView({ block: 'center' });
}

function viewLesson(id) {
  const lesson = LESSON_BY_ID[id];
  if (!lesson) { location.hash = '#/learn'; return; }
  if (lessonStatus(id) === 'locked') { location.hash = '#/learn'; return; }
  const unit = UNIT_BY_ID[lesson.unitId];
  runSession(app, {
    steps: buildLessonSteps(lesson.items, unitPool(unit.id)),
    onExit: () => history.length > 1 ? history.back() : (location.hash = '#/learn'),
    onDone: ({ mistakes, correct, answered }) => {
      const first = !store.isCompleted(id);
      const xp = (first ? 15 : 8) + (mistakes === 0 ? 5 : 0);
      store.completeLesson(id, lesson.items.map((i) => i.id), mistakes === 0);
      store.addXp(xp);
      showResults({
        title: first ? `You learned ${lesson.items.length} new phrases!` : 'Lesson replayed — great practice!',
        xp, correct, answered, back: '#/learn',
        words: lesson.items,
      });
    },
  });
}

function viewPractice() {
  const learned = learnedItems();
  const due = store.dueIds().length;
  const n = learned.length;
  app.innerHTML = `
    <section class="screen">
      <h1 class="title">Practice</h1>
      ${n === 0 ? `
        <div class="card empty"><span class="big-emoji">🌱</span><h2>Nothing to practise yet</h2>
        <p class="muted">Finish your first lesson and your words will show up here.</p>
        <a class="btn primary" href="#/learn">Go to lessons</a></div>` : `
      <a class="card practice-card ${due ? 'hot' : ''}" href="${due ? '#/review' : '#/practice'}" data-review>
        <span class="continue-emoji">🔁</span>
        <div class="grow"><h3>Review</h3><p class="muted">${due ? `${due} word${due > 1 ? 's are' : ' is'} ready for review` : 'All caught up! Come back tomorrow.'}</p></div>
        ${due ? '<span class="chev">›</span>' : '<span class="check">✓</span>'}
      </a>
      <a class="card practice-card" href="#/drill/listen">
        <span class="continue-emoji">👂</span>
        <div class="grow"><h3>Listening practice</h3><p class="muted">Hear Gujarati, pick the meaning</p></div><span class="chev">›</span>
      </a>
      <a class="card practice-card" href="#/drill/speak">
        <span class="continue-emoji">🗣️</span>
        <div class="grow"><h3>Speaking practice</h3><p class="muted">Say phrases out loud and compare</p></div><span class="chev">›</span>
      </a>
      <a class="card practice-card" href="#/drill/quiz">
        <span class="continue-emoji">⚡</span>
        <div class="grow"><h3>Quick quiz</h3><p class="muted">A mix of everything you've learned</p></div><span class="chev">›</span>
      </a>

      <h2 class="section-title">My words <span class="pill">${n}</span></h2>
      <div class="card word-list">
        ${learned.map((it) => {
          const box = state.srs[it.id]?.box || 1;
          const lvl = Math.min(5, Math.ceil(box / 1.4));
          return `<button class="word-row" data-id="${it.id}">
            <div class="grow"><b class="rom">${esc(it.rom)}</b>${scriptLine(it)}<small>${esc(it.en)}</small></div>
            <span class="strength" title="Memory strength">${'<i class="on"></i>'.repeat(lvl)}${'<i></i>'.repeat(5 - lvl)}</span>
          </button>`;
        }).join('')}
      </div>`}
    </section>`;
  app.querySelector('[data-review]')?.addEventListener('click', (e) => { if (!due) { e.preventDefault(); toast('No words due — nice work! 🎉'); } });
  app.querySelectorAll('.word-row').forEach((b) => { b.onclick = () => playItem(ITEMS[b.dataset.id]); });
}

function viewDrill(kind) {
  const learned = learnedItems();
  if (learned.length < 2) { toast('Finish a lesson first 🙂'); location.hash = '#/practice'; return; }
  const titles = { listen: 'Listening practice done!', speak: 'Speaking practice done!', quiz: 'Quiz complete!' };
  runSession(app, {
    steps: buildDrillSteps(kind, learned),
    onExit: () => { location.hash = '#/practice'; },
    onDone: ({ correct, answered }) => {
      const xp = kind === 'speak' ? 6 : Math.max(3, correct);
      store.addXp(xp);
      showResults({ title: titles[kind] || 'Done!', xp, correct, answered, back: '#/practice' });
    },
  });
}

function viewReview() {
  const ids = shuffle(store.dueIds()).slice(0, 15);
  if (!ids.length) { location.hash = '#/practice'; return; }
  const queue = ids.map((id) => ({ id, dir: Math.random() < 0.5 ? 'say' : 'hear' }));
  let pos = 0, good = 0;
  const reviewed = new Set();

  app.innerHTML = `
    <div class="lesson">
      <header class="lesson-top">
        <button class="icon-btn" data-exit aria-label="Quit">${ICONS.close}</button>
        <div class="progress"><div class="bar"></div></div>
      </header>
      <main class="lesson-body"></main>
      <footer class="lesson-foot"></footer>
    </div>`;
  const body = app.querySelector('.lesson-body');
  const foot = app.querySelector('.lesson-foot');
  const bar = app.querySelector('.bar');
  app.querySelector('[data-exit]').onclick = () => { stopAudio(); location.hash = '#/practice'; };

  function draw() {
    if (pos >= queue.length) {
      const xp = reviewed.size;
      store.addXp(xp);
      return showResults({ title: `You reviewed ${reviewed.size} words`, xp, correct: good, answered: pos, back: '#/practice' });
    }
    bar.style.width = `${Math.round((pos / queue.length) * 100)}%`;
    const c = queue[pos], it = ITEMS[c.id];
    body.innerHTML = c.dir === 'say' ? `
      <p class="step-label">How do you say…</p>
      <div class="card flash"><h2 class="prompt">“${esc(it.en)}”</h2><div class="answer" hidden>
        <hr><h2 class="rom">${esc(it.rom)}</h2>${scriptLine(it)}<button class="play" data-play>${ICONS.speaker}</button></div></div>
      <p class="muted center small">Say it out loud first, then check.</p>` : `
      <p class="step-label">What does this mean?</p>
      <div class="card flash"><button class="play big" data-play>${ICONS.speaker}</button>
        <h2 class="rom">${esc(it.rom)}</h2>${scriptLine(it)}
        <div class="answer" hidden><hr><p class="en big-en">${esc(it.en)}</p></div></div>`;
    body.querySelector('[data-play]').onclick = () => playItem(it);
    if (c.dir === 'hear') setTimeout(() => playItem(it), 300);
    foot.className = 'lesson-foot';
    foot.innerHTML = '<button class="btn primary big" data-show>Show answer</button>';
    foot.querySelector('[data-show]').onclick = () => {
      body.querySelector('.answer').hidden = false;
      if (c.dir === 'say') playItem(it);
      foot.innerHTML = `
        <p class="grade-q">How well did you know it?</p>
        <div class="grade">
          <button class="btn grade-again" data-g="again">Again<small>forgot</small></button>
          <button class="btn grade-good" data-g="good">Good<small>got it</small></button>
          <button class="btn grade-easy" data-g="easy">Easy<small>too easy</small></button>
        </div>`;
      foot.querySelectorAll('[data-g]').forEach((b) => {
        b.onclick = () => {
          const g = b.dataset.g;
          store.grade(c.id, g);
          reviewed.add(c.id);
          if (g === 'again') { if (!c.again) queue.push({ ...c, again: true }); sfx('tap'); } else { good++; sfx('good'); }
          stopAudio();
          pos++;
          draw();
        };
      });
    };
  }
  draw();
}

// ---------- phrasebook ----------

let pbCat = 'all', pbQuery = '', pbUrls = [];

async function viewPhrases() {
  pbUrls.forEach((u) => URL.revokeObjectURL(u));
  pbUrls = [];
  const custom = await idb.allCustom();
  const mine = [
    ...PERSONAL.phrases.map((p, i) => ({ ...p, id: `personal-${i}`, mine: true })),
    ...custom.map((c) => {
      const url = c.blob ? URL.createObjectURL(c.blob) : null;
      if (url) pbUrls.push(url);
      return { ...c, audioUrl: url, mine: true, custom: true };
    }),
  ];
  const cats = [['all', 'All'], ['mine', FROM_LABEL], ...UNITS.map((u) => [u.id, `${u.emoji} ${u.title}`])];

  app.innerHTML = `
    <section class="screen">
      <h1 class="title">Phrases</h1>
      <label class="search">${ICONS.search}<input type="search" placeholder="Search in English or Gujarati" value="${esc(pbQuery)}" aria-label="Search phrases"></label>
      <div class="chips">${cats.map(([id, label]) => `<button class="chip ${pbCat === id ? 'on' : ''}" data-cat="${id}">${esc(label)}</button>`).join('')}</div>
      <div class="phrase-list"></div>
    </section>`;
  const list = app.querySelector('.phrase-list');
  const all = [...mine, ...ALL_ITEMS];

  function renderList() {
    const q = norm(pbQuery);
    let rows = pbCat === 'all' ? all : pbCat === 'mine' ? mine : ALL_ITEMS.filter((i) => i.unitId === pbCat);
    if (q) rows = rows.filter((i) => [i.rom, i.en, i.gu, i.note].some((f) => f && norm(f).includes(q)));
    const addBtn = pbCat === 'mine' ? `
      <div class="card mine-intro"><p>Phrases just for ${esc(NAME)}. Add your own — and record how they sound!</p>
      <button class="btn primary" data-add>${ICONS.plus}<span>Add a phrase</span></button></div>` : '';
    list.innerHTML = addBtn + (rows.length ? `<div class="card word-list">${rows.map((it) => `
      <div class="word-row" data-id="${esc(it.id)}" role="button" tabindex="0">
        <button class="play sm" aria-label="Listen" data-pid="${esc(it.id)}">${ICONS.speaker}</button>
        <div class="grow"><b class="rom">${esc(it.rom)}</b>${scriptLine(it)}<small>${esc(it.en)}</small>${it.note ? `<small class="note-sm">💡 ${esc(it.note)}</small>` : ''}</div>
        ${it.custom ? `<button class="icon-btn sm" data-del="${esc(it.id)}" aria-label="Delete">${ICONS.trash}</button>` : ''}
      </div>`).join('')}</div>` : `<p class="muted center">No phrases found${q ? ` for “${esc(pbQuery)}”` : ''}.</p>`);
    list.querySelector('[data-add]')?.addEventListener('click', () => openAddPhrase(viewPhrases));
  }

  list.addEventListener('click', async (e) => {
    const del = e.target.closest('[data-del]');
    if (del) {
      e.stopPropagation();
      if (confirm('Delete this phrase?')) { await idb.deleteCustom(del.dataset.del); viewPhrases(); }
      return;
    }
    const row = e.target.closest('.word-row');
    if (row) playItem(all.find((i) => i.id === row.dataset.id));
  });
  app.querySelector('.search input').addEventListener('input', (e) => { pbQuery = e.target.value; renderList(); });
  app.querySelectorAll('[data-cat]').forEach((b) => {
    b.onclick = () => {
      pbCat = b.dataset.cat;
      app.querySelectorAll('[data-cat]').forEach((x) => x.classList.toggle('on', x === b));
      renderList();
    };
  });
  renderList();
  app.querySelector('.chip.on')?.scrollIntoView({ inline: 'center', block: 'nearest' });
}

function openAddPhrase(after) {
  const dlg = document.createElement('div');
  dlg.className = 'modal';
  dlg.innerHTML = `
    <form class="sheet">
      <h2>Add a phrase</h2>
      <label>In English<input name="en" required placeholder="e.g. Good night, Ba"></label>
      <label>How it sounds (English letters)<input name="rom" required placeholder="e.g. Shubh raatri, Ba"></label>
      <label><span>Gujarati script <small>(optional)</small></span><input name="gu" placeholder="e.g. શુભ રાત્રિ, બા" lang="gu"></label>
      <label><span>Note <small>(optional)</small></span><input name="note" placeholder="When to use it"></label>
      ${recSupported ? `<div class="rec-field"><button type="button" class="btn soft" data-rec>${ICONS.mic}<span>Record pronunciation</span></button>
      <button type="button" class="btn soft" data-hear hidden>${ICONS.play}<span>Play</span></button></div>
      <p class="muted small">Tip: ask someone in the family to record it for you!</p>` : ''}
      <div class="sheet-actions"><button type="button" class="btn ghost" data-cancel>Cancel</button><button class="btn primary" type="submit">Save</button></div>
    </form>`;
  document.body.appendChild(dlg);
  requestAnimationFrame(() => dlg.classList.add('show'));
  const form = dlg.querySelector('form');
  let blob = null, rec = null, url = null;
  const close = () => { rec?.stop(); dlg.classList.remove('show'); setTimeout(() => dlg.remove(), 250); };
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  dlg.querySelector('[data-cancel]').onclick = close;
  const recBtn = dlg.querySelector('[data-rec]'), hear = dlg.querySelector('[data-hear]');
  const stopRec = async () => {
    const r = rec; rec = null;
    blob = await r.stop();
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(blob);
    recBtn.classList.remove('recording');
    recBtn.querySelector('span').textContent = 'Record again';
    hear.hidden = false;
  };
  if (recBtn) recBtn.onclick = async () => {
    if (rec) return stopRec();
    try {
      rec = new Recorder(); rec.onAutoStop = stopRec; await rec.start();
      recBtn.classList.add('recording'); recBtn.querySelector('span').textContent = 'Stop';
    } catch { rec = null; toast('Microphone not available'); }
  };
  if (hear) hear.onclick = () => new Audio(url).play();
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (rec) await stopRec();
    const f = new FormData(form);
    await idb.putCustom({
      id: `c${Date.now()}`, createdAt: Date.now(), blob,
      en: f.get('en').trim(), rom: f.get('rom').trim(), gu: f.get('gu').trim(), note: f.get('note').trim(),
    });
    close();
    toast('Phrase saved ❤️');
    after();
  };
}

// ---------- notes ----------

function viewNotes() {
  app.innerHTML = `
    <section class="screen">
      <header class="sub-head"><a class="icon-btn" href="#/home" aria-label="Back">${ICONS.back}</a><h1 class="title">Notes for you 💌</h1></header>
      <p class="muted">Little surprises that unlock as you learn.</p>
      <div class="notes">
        ${PERSONAL.loveNotes.map((n) => state.notes.includes(n.id) ? `
          <button class="card note-card open" data-note="${n.id}"><span class="env">💌</span><div class="grow"><h3>${esc(n.title)}</h3><p class="muted">Tap to read</p></div></button>` : `
          <div class="card note-card locked"><span class="env">🔒</span><div class="grow"><h3>Locked</h3><p class="muted">Unlocks at ${unlockLabel(n.unlock)}</p></div></div>`).join('')}
      </div>
    </section>`;
  app.querySelectorAll('[data-note]').forEach((b) => { b.onclick = () => showNotes([b.dataset.note]); });
}

function showNotes(ids, done = () => {}) {
  if (!ids.length) return done();
  const n = PERSONAL.loveNotes.find((x) => x.id === ids[0]);
  if (!n) return showNotes(ids.slice(1), done);
  const dlg = document.createElement('div');
  dlg.className = 'modal center';
  dlg.innerHTML = `
    <div class="love-note">
      <div class="seal">💌</div>
      <p class="eyebrow">A note for ${esc(NAME)}</p>
      <h2>${esc(n.title)}</h2>
      <p class="note-text">${esc(n.text)}</p>
      <p class="sign">— ${esc(FROM)}</p>
      <button class="btn primary big" data-ok>❤️ Aww, thank you</button>
    </div>`;
  document.body.appendChild(dlg);
  requestAnimationFrame(() => dlg.classList.add('show'));
  sfx('win');
  dlg.querySelector('[data-ok]').onclick = () => {
    dlg.classList.remove('show');
    setTimeout(() => { dlg.remove(); showNotes(ids.slice(1), done); }, 250);
  };
}

// ---------- results ----------

function showResults({ title, xp, correct, answered, back, words }) {
  sfx('win');
  const acc = answered ? Math.round((correct / answered) * 100) : 100;
  app.innerHTML = `
    <section class="screen results">
      <div class="burst" aria-hidden="true">${['🎉', '✨', '🪔', '⭐', '🎊'].map((e, i) => `<span style="--i:${i}">${e}</span>`).join('')}</div>
      <div class="trophy">🏆</div>
      <h1>Shabaash, ${esc(NAME)}!</h1>
      <p class="gu-sub">શાબાશ!</p>
      <p class="lead">${esc(title)}</p>
      <div class="result-stats">
        <div><b>+${xp}</b><small>XP</small></div>
        <div><b>${acc}%</b><small>accuracy</small></div>
        <div><b>🔥 ${store.streak()}</b><small>streak</small></div>
      </div>
      ${words ? `<div class="card word-list compact">${words.map((it) => `<button class="word-row" data-id="${it.id}"><div class="grow"><b class="rom">${esc(it.rom)}</b><small>${esc(it.en)}</small></div>${ICONS.speaker}</button>`).join('')}</div>` : ''}
      <button class="btn primary big" data-go>Continue</button>
    </section>`;
  app.querySelectorAll('.word-row').forEach((b) => { b.onclick = () => playItem(ITEMS[b.dataset.id]); });
  app.querySelector('[data-go]').onclick = () => showNotes(store.takeNewNotes(), () => { location.hash = back; });
}

// ---------- settings ----------

function viewSettings() {
  const st = state.settings;
  const v = guVoice();
  app.innerHTML = `
    <section class="screen">
      <header class="sub-head"><a class="icon-btn" href="#/home" aria-label="Back">${ICONS.back}</a><h1 class="title">Settings</h1></header>

      <div class="card settings">
        <label class="row"><div class="grow"><b>Show Gujarati script</b><small>Show ગુજરાતી under each phrase</small></div><input type="checkbox" class="switch" data-k="showScript" ${st.showScript ? 'checked' : ''}></label>
        <label class="row"><div class="grow"><b>Sound effects</b><small>Little dings for right and wrong answers</small></div><input type="checkbox" class="switch" data-k="sound" ${st.sound ? 'checked' : ''}></label>
        <label class="row col"><div class="grow"><b>Voice speed</b><small>Slower is easier to follow</small></div>
          <input type="range" min="0.5" max="1.2" step="0.05" value="${st.rate}" data-rate aria-label="Voice speed"></label>
        <label class="row"><div class="grow"><b>Daily goal</b><small>XP per day</small></div>
          <select data-goal>${[10, 20, 30, 50, 80].map((g) => `<option value="${g}" ${g === st.dailyGoal ? 'selected' : ''}>${g} XP</option>`).join('')}</select></label>
      </div>

      <h2 class="section-title">Gujarati voice</h2>
      <div class="card settings">
        <div class="row"><div class="grow"><b>${!ttsSupported ? 'Speech not supported in this browser' : v ? 'Gujarati voice found ✓' : 'Check the Gujarati voice'}</b>
          <small>${v ? esc(v.name) : 'Tap Test. If you hear nothing, install the voice (below).'}</small></div>
          <button class="btn soft sm" data-test>${ICONS.speaker}<span>Test</span></button></div>
        <details class="help"><summary>No sound? Install the Gujarati voice</summary>
          <ol>
            <li>Open your phone's <b>Settings</b> and search for <b>“Text-to-speech”</b>.</li>
            <li>Set the preferred engine to <b>Speech Services by Google</b>.</li>
            <li>Tap the ⚙️ next to it → <b>Install voice data</b> → <b>ગુજરાતી (Gujarati, India)</b>.</li>
            <li>Come back here and tap <b>Test</b>.</li>
          </ol></details>
      </div>

      <h2 class="section-title">App</h2>
      <div class="card settings">
        <div class="row" id="install-row"><div class="grow"><b>Install on home screen</b><small>In Chrome: ⋮ menu → “Add to Home screen”</small></div></div>
        <div class="row"><div class="grow"><b>Your progress</b><small>${store.learnedIds().length} words · ${Object.keys(state.completed).length} lessons · best streak ${state.bestStreak}</small></div></div>
        <div class="row"><div class="grow"><b>Start over</b><small>Erase all progress on this phone</small></div><button class="btn danger sm" data-reset>Reset</button></div>
      </div>
      <p class="muted center small">Made with ❤️ for ${esc(NAME)}</p>
    </section>`;

  app.querySelectorAll('[data-k]').forEach((el) => { el.onchange = () => store.setSetting(el.dataset.k, el.checked); });
  app.querySelector('[data-rate]').onchange = (e) => { store.setSetting('rate', Number(e.target.value)); speak('કેમ છો?'); };
  app.querySelector('[data-goal]').onchange = (e) => store.setSetting('dailyGoal', Number(e.target.value));
  app.querySelector('[data-test]').onclick = () => speak('કેમ છો? હું મજામાં છું.');
  app.querySelector('[data-reset]').onclick = () => {
    if (confirm('Erase all progress? This cannot be undone.')) { store.resetAll(); toast('Progress reset'); location.hash = '#/home'; }
  };
  if (deferredInstall) {
    const row = app.querySelector('#install-row');
    const b = document.createElement('button');
    b.className = 'btn primary sm'; b.textContent = 'Install';
    b.onclick = doInstall;
    row.appendChild(b);
  }
}

// ---------- install prompt ----------

let deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstall = e;
  renderInstallSlot();
});
async function doInstall() {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice.catch(() => {});
  deferredInstall = null;
  renderInstallSlot();
}
function renderInstallSlot() {
  const slot = document.getElementById('install-slot');
  if (!slot) return;
  let dismissed = false;
  try { dismissed = localStorage.getItem('kemcho-install-dismissed') === '1'; } catch { /* ignore */ }
  if (!deferredInstall || dismissed) { slot.innerHTML = ''; return; }
  slot.innerHTML = `<div class="card install"><span class="continue-emoji">📲</span><div class="grow"><b>Add to your home screen</b><small>Opens like a real app, works offline</small></div>
    <button class="btn primary sm" data-install>Install</button><button class="icon-btn sm" data-dismiss aria-label="Dismiss">${ICONS.close}</button></div>`;
  slot.querySelector('[data-install]').onclick = doInstall;
  slot.querySelector('[data-dismiss]').onclick = () => {
    try { localStorage.setItem('kemcho-install-dismissed', '1'); } catch { /* ignore */ }
    slot.innerHTML = '';
  };
}

// ---------------- router ----------------

const ROUTES = {
  home: viewHome, learn: viewLearn, practice: viewPractice, phrases: viewPhrases,
  settings: viewSettings, notes: viewNotes, lesson: viewLesson, review: viewReview,
  drill: viewDrill, welcome: viewWelcome,
};
const TAB_OF = { home: 'home', settings: 'home', notes: 'home', learn: 'learn', practice: 'practice', phrases: 'phrases' };

function router() {
  stopAudio();
  Recorder.stopAll();
  document.querySelectorAll('.modal').forEach((m) => m.remove());
  let [name, arg] = location.hash.replace(/^#\/?/, '').split('/');
  if (!state.onboarded) name = 'welcome';
  if (!ROUTES[name]) name = 'home';
  document.body.classList.toggle('fullscreen', FULLSCREEN.has(name));
  tabbar.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.dataset.tab === TAB_OF[name]));
  window.scrollTo(0, 0);
  ROUTES[name](arg ? decodeURIComponent(arg) : undefined);
}

tabbar.innerHTML = [['home', 'Home'], ['learn', 'Learn'], ['practice', 'Practice'], ['phrases', 'Phrases']]
  .map(([id, label]) => `<a href="#/${id}" data-tab="${id}">${ICONS[id]}<span>${label}</span></a>`).join('');

initSpeech();
window.addEventListener('hashchange', router);
router();

// Re-render the settings screen once voices load (they arrive async on Android).
if (ttsSupported) speechSynthesis.addEventListener?.('voiceschanged', () => { if (location.hash.startsWith('#/settings')) viewSettings(); });

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
