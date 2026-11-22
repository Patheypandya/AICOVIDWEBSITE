// The lesson / drill engine: builds a list of steps and plays them one by one.
import { ALL_ITEMS } from './data.js';
import { state } from './store.js';
import { playItem, stopAudio, Recorder, recSupported, ttsSupported } from './speech.js';
import { esc, shuffle, pick, norm, sfx, toast, ICONS } from './ui.js';

const PRAISE = ['Saras! 🎉', 'Shabaash! 👏', 'Bahu saras! ✨', 'Waah! 🌟', 'Ekdum perfect! 💯'];
const ENCOURAGE = ['Almost!', 'Not quite —', 'Close one!'];

const wordsOf = (it) => it.rom.replace(/[?!.,]/g, '').split(/\s+/).filter(Boolean);
const scriptHtml = (it) => (state.settings.showScript && it.gu ? `<span class="gu">${esc(it.gu)}</span>` : '');

function distractors(item, pool, key, n = 3) {
  const seen = new Set([norm(item[key])]);
  const out = [];
  for (const src of [shuffle(pool), shuffle(ALL_ITEMS)]) {
    for (const c of src) {
      if (out.length >= n) return out;
      const k = norm(c[key]);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(c);
    }
  }
  return out;
}

// ---------- step builders ----------

export function buildLessonSteps(items, pool) {
  const steps = [];
  for (let i = 0; i < items.length; i += 2) {
    const group = items.slice(i, i + 2);
    group.forEach((item) => steps.push({ type: 'intro', item }));
    group.forEach((item, j) => steps.push({ type: j % 2 ? 'listen' : 'mc', item }));
  }
  if (items.length >= 3) steps.push({ type: 'match', items: shuffle(items).slice(0, 5) });
  items.filter((it) => wordsOf(it).length >= 3).slice(0, 2).forEach((item) => steps.push({ type: 'build', item }));
  shuffle(items).slice(0, 2).forEach((item) => steps.push({ type: 'listen', item }));
  const longest = items.reduce((a, b) => (wordsOf(b).length > wordsOf(a).length ? b : a));
  steps.push({ type: 'speak', item: longest });
  steps.push({ type: 'mc', item: pick(items) });
  return steps.map((s) => ({ ...s, pool }));
}

export function buildDrillSteps(kind, learned) {
  const pool = learned;
  const items = shuffle(learned);
  if (kind === 'listen') return items.slice(0, 10).map((item) => ({ type: 'listen', item, pool }));
  if (kind === 'speak') return items.slice(0, 6).map((item) => ({ type: 'speak', item, pool }));
  // mixed quiz
  const steps = [];
  items.slice(0, 10).forEach((item, i) => {
    const multi = wordsOf(item).length >= 3;
    const type = multi && i % 3 === 0 ? 'build' : i % 2 ? 'listen' : 'mc';
    steps.push({ type, item, pool });
  });
  if (learned.length >= 4) steps.splice(5, 0, { type: 'match', items: shuffle(learned).slice(0, 5), pool });
  return steps;
}

// ---------- shared widgets ----------

function recorderHtml(label = 'Try saying it') {
  if (!recSupported) return '';
  return `<div class="recorder">
    <button class="btn soft" data-rec>${ICONS.mic}<span>${label}</span></button>
    <button class="btn soft" data-mine hidden>${ICONS.play}<span>Me vs. native</span></button>
  </div>`;
}

function wireRecorder(root, item) {
  const w = root.querySelector('.recorder');
  if (!w) return;
  const recBtn = w.querySelector('[data-rec]');
  const mineBtn = w.querySelector('[data-mine]');
  let rec = null, url = null;
  const stop = async () => {
    if (!rec) return;
    const r = rec; rec = null;
    const blob = await r.stop();
    recBtn.classList.remove('recording');
    recBtn.querySelector('span').textContent = 'Record again';
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(blob);
    mineBtn.hidden = false;
    compare();
  };
  const compare = () => {
    stopAudio();
    const a = new Audio(url);
    a.onended = () => setTimeout(() => playItem(item), 350);
    a.play().catch(() => {});
  };
  recBtn.onclick = async () => {
    if (rec) return stop();
    try {
      stopAudio();
      rec = new Recorder();
      rec.onAutoStop = stop;
      await rec.start();
      recBtn.classList.add('recording');
      recBtn.querySelector('span').textContent = 'Stop';
    } catch {
      rec = null;
      toast('Allow microphone access to practise speaking 🎤');
    }
  };
  mineBtn.onclick = compare;
}

function playButtons(item, { big = false, slow = true } = {}) {
  return `<div class="play-row">
    <button class="play ${big ? 'big' : ''}" data-play aria-label="Listen">${ICONS.speaker}</button>
    ${slow ? `<button class="play slow" data-slow aria-label="Listen slowly">${ICONS.slow}</button>` : ''}
  </div>`;
}

function wirePlay(root, item) {
  root.querySelector('[data-play]')?.addEventListener('click', () => playItem(item));
  root.querySelector('[data-slow]')?.addEventListener('click', () => playItem(item, { slow: true }));
}

function optionList(root, opts, render, onPick) {
  const wrap = root.querySelector('.options');
  wrap.innerHTML = opts.map((o, i) => `<button class="option" data-i="${i}">${render(o)}</button>`).join('');
  wrap.addEventListener('click', (e) => {
    const b = e.target.closest('.option');
    if (!b || root.classList.contains('locked')) return;
    wrap.querySelectorAll('.option').forEach((x) => x.classList.toggle('selected', x === b));
    onPick(Number(b.dataset.i));
  });
  return wrap;
}

function markOptions(wrap, opts, correctItem, sel) {
  wrap.querySelectorAll('.option').forEach((b, i) => {
    if (opts[i] === correctItem) b.classList.add('correct');
    else if (i === sel) b.classList.add('wrong');
  });
}

// ---------- step renderers ----------

const RENDER = {
  intro(body, { item }) {
    body.innerHTML = `
      <p class="step-label">New phrase</p>
      <div class="card phrase-card pop">
        ${playButtons(item, { big: true })}
        <h2 class="rom">${esc(item.rom)}</h2>
        ${scriptHtml(item)}
        <p class="en">${esc(item.en)}</p>
        ${item.note ? `<p class="note">💡 ${esc(item.note)}</p>` : ''}
      </div>
      ${recorderHtml()}`;
    wirePlay(body, item);
    wireRecorder(body, item);
    setTimeout(() => playItem(item), 350);
    return { mode: 'continue' };
  },

  mc(body, { item, pool }, api) {
    const opts = shuffle([item, ...distractors(item, pool, 'rom')]);
    let sel = null;
    body.innerHTML = `
      <p class="step-label">How do you say…</p>
      <h2 class="prompt">“${esc(item.en)}”</h2>
      <div class="options"></div>`;
    const wrap = optionList(body, opts, (o) => `<span class="rom">${esc(o.rom)}</span>${scriptHtml(o)}`, (i) => {
      sel = i; playItem(opts[i]); api.ready(true);
    });
    return { mode: 'check', check: () => { markOptions(wrap, opts, item, sel); return { ok: opts[sel] === item, answer: item }; } };
  },

  listen(body, { item, pool }, api) {
    const opts = shuffle([item, ...distractors(item, pool, 'en')]);
    let sel = null;
    body.innerHTML = `
      <p class="step-label">What does this mean?</p>
      <div class="listen-box">
        ${playButtons(item, { big: true })}
        <button class="reveal ${ttsSupported ? '' : 'shown'}" data-reveal>${ttsSupported ? 'Show words' : esc(item.rom)}</button>
      </div>
      <div class="options"></div>`;
    wirePlay(body, item);
    const rv = body.querySelector('[data-reveal]');
    rv.onclick = () => { rv.textContent = item.rom; rv.classList.add('shown'); };
    const wrap = optionList(body, opts, (o) => `<span class="en-opt">${esc(o.en)}</span>`, (i) => { sel = i; api.ready(true); });
    setTimeout(() => playItem(item), 350);
    return { mode: 'check', check: () => { markOptions(wrap, opts, item, sel); return { ok: opts[sel] === item, answer: item }; } };
  },

  match(body, { items }, api) {
    const left = shuffle(items), right = shuffle(items);
    let selL = null, done = 0;
    body.innerHTML = `
      <p class="step-label">Match the pairs</p>
      <div class="match">
        <div class="col">${left.map((it) => `<button class="tile" data-side="l" data-id="${it.id}"><span class="rom">${esc(it.rom)}</span></button>`).join('')}</div>
        <div class="col">${right.map((it) => `<button class="tile" data-side="r" data-id="${it.id}">${esc(it.en)}</button>`).join('')}</div>
      </div>`;
    body.querySelector('.match').addEventListener('click', (e) => {
      const t = e.target.closest('.tile');
      if (!t || t.classList.contains('matched')) return;
      if (t.dataset.side === 'l') {
        body.querySelectorAll('[data-side="l"]').forEach((x) => x.classList.toggle('selected', x === t));
        selL = t;
        playItem(items.find((i) => i.id === t.dataset.id));
        return;
      }
      if (!selL) { t.classList.add('shake'); setTimeout(() => t.classList.remove('shake'), 400); return; }
      if (selL.dataset.id === t.dataset.id) {
        [selL, t].forEach((x) => { x.classList.remove('selected'); x.classList.add('matched'); });
        selL = null; done++;
        sfx('good');
        if (done === items.length) api.ready(true);
      } else {
        sfx('bad');
        [selL, t].forEach((x) => { x.classList.add('shake'); setTimeout(() => x.classList.remove('shake'), 400); });
      }
    });
    return { mode: 'continue', initialReady: false };
  },

  build(body, { item, pool }, api) {
    const words = wordsOf(item);
    const extra = shuffle(pool.flatMap(wordsOf).filter((w) => !words.some((x) => norm(x) === norm(w))))
      .filter((w, i, a) => a.findIndex((x) => norm(x) === norm(w)) === i).slice(0, 2);
    const bank = shuffle([...words, ...extra]).map((w, i) => ({ w, i }));
    const answer = [];
    body.innerHTML = `
      <p class="step-label">Build the sentence</p>
      <h2 class="prompt">“${esc(item.en)}”</h2>
      <div class="answer-line"></div>
      <div class="bank"></div>`;
    const ans = body.querySelector('.answer-line'), bk = body.querySelector('.bank');
    const draw = () => {
      ans.innerHTML = answer.map((t) => `<button class="word" data-i="${t.i}">${esc(t.w)}</button>`).join('') || '<span class="hint">Tap the words in order</span>';
      bk.innerHTML = bank.map((t) => `<button class="word ${answer.includes(t) ? 'used' : ''}" data-i="${t.i}">${esc(t.w)}</button>`).join('');
      api.ready(answer.length > 0);
    };
    ans.onclick = (e) => {
      const b = e.target.closest('.word');
      if (!b || body.classList.contains('locked')) return;
      const k = answer.findIndex((t) => t.i === Number(b.dataset.i));
      answer.splice(k, 1); draw();
    };
    bk.onclick = (e) => {
      const b = e.target.closest('.word');
      if (!b || b.classList.contains('used') || body.classList.contains('locked')) return;
      answer.push(bank.find((t) => t.i === Number(b.dataset.i))); sfx('tap'); draw();
    };
    draw();
    return {
      mode: 'check',
      check: () => {
        const ok = norm(answer.map((t) => t.w).join(' ')) === norm(words.join(' '));
        ans.classList.add(ok ? 'correct' : 'wrong');
        return { ok, answer: item };
      },
    };
  },

  speak(body, { item }) {
    body.innerHTML = `
      <p class="step-label">Say it out loud 🗣️</p>
      <div class="card phrase-card">
        ${playButtons(item)}
        <h2 class="rom">${esc(item.rom)}</h2>
        ${scriptHtml(item)}
        <p class="en">${esc(item.en)}</p>
      </div>
      ${recorderHtml('Record yourself') || '<p class="muted center">Listen, then say it out loud a few times.</p>'}
      <p class="muted center small">Record, then hear yourself next to the native audio.</p>`;
    wirePlay(body, item);
    wireRecorder(body, item);
    setTimeout(() => playItem(item), 350);
    return { mode: 'continue', label: 'I said it! 🎉' };
  },
};

// ---------- session runner ----------

export function runSession(root, { steps, onExit, onDone }) {
  const queue = [...steps];
  let pos = 0, mistakes = 0, correct = 0, answered = 0;

  root.innerHTML = `
    <div class="lesson">
      <header class="lesson-top">
        <button class="icon-btn" data-exit aria-label="Quit">${ICONS.close}</button>
        <div class="progress"><div class="bar"></div></div>
      </header>
      <main class="lesson-body"></main>
      <footer class="lesson-foot">
        <div class="feedback" hidden></div>
        <button class="btn primary big" data-main>Check</button>
      </footer>
    </div>`;
  const body = root.querySelector('.lesson-body');
  const btn = root.querySelector('[data-main]');
  const fb = root.querySelector('.feedback');
  const bar = root.querySelector('.bar');
  const foot = root.querySelector('.lesson-foot');

  root.querySelector('[data-exit]').onclick = () => {
    if (confirm('Leave now? Progress in this session won\'t be saved.')) { Recorder.stopAll(); stopAudio(); onExit(); }
  };

  let handler, checked;
  function render() {
    if (pos >= queue.length) { Recorder.stopAll(); return onDone({ mistakes, correct, answered }); }
    const step = queue[pos];
    bar.style.width = `${Math.round((pos / queue.length) * 100)}%`;
    checked = false;
    fb.hidden = true;
    foot.className = 'lesson-foot';
    body.className = 'lesson-body';
    body.scrollTop = 0;
    const api = { ready: (v) => { if (!checked) btn.disabled = !v; } };
    handler = RENDER[step.type](body, step, api) || { mode: 'continue' };
    if (handler.mode === 'continue') {
      btn.textContent = handler.label || 'Continue';
      btn.disabled = handler.initialReady === false;
    } else {
      btn.textContent = 'Check';
      btn.disabled = true;
    }
  }

  btn.onclick = () => {
    const step = queue[pos];
    if (handler.mode === 'check' && !checked) {
      const r = handler.check();
      checked = true;
      answered++;
      body.classList.add('locked');
      if (r.ok) {
        correct++;
        sfx('good');
        foot.classList.add('good');
        fb.innerHTML = `<b>${pick(PRAISE)}</b>`;
      } else {
        mistakes++;
        sfx('bad');
        foot.classList.add('bad');
        if (!step.retry) queue.push({ ...step, retry: true });
        fb.innerHTML = `<b>${pick(ENCOURAGE)}</b> <span>The answer is <strong>${esc(r.answer.rom)}</strong> — ${esc(r.answer.en)}</span>`;
      }
      fb.hidden = false;
      setTimeout(() => playItem(r.answer), r.ok ? 250 : 500);
      btn.textContent = 'Continue';
      btn.disabled = false;
      return;
    }
    Recorder.stopAll();
    stopAudio();
    pos++;
    render();
  };

  render();
}
