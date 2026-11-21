// Progress, streaks, XP and spaced repetition — saved in localStorage on the phone.
import { PERSONAL } from './personal.js';

const KEY = 'kemcho-v1';
// Days until the next review for each Leitner box.
const INTERVALS = [0, 1, 2, 4, 7, 15, 30, 60];
const MAX_BOX = INTERVALS.length - 1;

const defaults = () => ({
  xp: 0,
  streak: 0,
  bestStreak: 0,
  lastDay: null,
  todayXp: 0,
  todayDate: null,
  completed: {},   // lessonId -> { at, times, perfect }
  srs: {},         // itemId -> { box, due: 'YYYY-MM-DD' }
  notes: [],       // unlocked love note ids
  newNotes: [],    // unlocked but not yet shown
  onboarded: false,
  settings: { showScript: true, rate: 0.85, dailyGoal: 30, sound: true },
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      const d = defaults();
      return { ...d, ...s, settings: { ...d.settings, ...(s.settings || {}) } };
    }
  } catch { /* private mode / blocked storage */ }
  return defaults();
}

export const state = load();

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function dayStr(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function rollDay() {
  const t = dayStr();
  if (state.todayDate !== t) { state.todayDate = t; state.todayXp = 0; }
}

export function streak() {
  return state.lastDay === dayStr() || state.lastDay === dayStr(-1) ? state.streak : 0;
}

export function todayXp() { rollDay(); return state.todayXp; }

export function addXp(n) {
  rollDay();
  state.xp += n;
  state.todayXp += n;
  const t = dayStr();
  if (state.lastDay !== t) {
    state.streak = state.lastDay === dayStr(-1) ? state.streak + 1 : 1;
    state.lastDay = t;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
  }
  checkNotes();
  save();
}

export function completeLesson(lessonId, itemIds, perfect) {
  const prev = state.completed[lessonId];
  state.completed[lessonId] = { at: Date.now(), times: (prev?.times || 0) + 1, perfect: !!(perfect || prev?.perfect) };
  for (const id of itemIds) {
    if (!state.srs[id]) state.srs[id] = { box: 1, due: dayStr(1) };
  }
  save();
}

export function grade(id, g) {
  const cur = state.srs[id] || { box: 0 };
  const box = g === 'again' ? 1 : Math.min(cur.box + (g === 'easy' ? 2 : 1), MAX_BOX);
  state.srs[id] = { box, due: g === 'again' ? dayStr(0) : dayStr(INTERVALS[box]) };
  save();
}

export const learnedIds = () => Object.keys(state.srs);
export const dueIds = () => {
  const t = dayStr();
  return Object.entries(state.srs).filter(([, s]) => s.due <= t).map(([id]) => id);
};
export const isCompleted = (lessonId) => !!state.completed[lessonId];

function checkNotes() {
  const stats = {
    streak: streak(),
    lessons: Object.keys(state.completed).length,
    words: learnedIds().length,
    xp: state.xp,
  };
  for (const n of PERSONAL.loveNotes) {
    if (state.notes.includes(n.id)) continue;
    const ok = Object.entries(n.unlock).every(([k, v]) => (stats[k] || 0) >= v);
    if (ok) { state.notes.push(n.id); state.newNotes.push(n.id); }
  }
}

export function takeNewNotes() {
  const n = state.newNotes;
  state.newNotes = [];
  save();
  return n;
}

export function setSetting(k, v) { state.settings[k] = v; save(); }

export function resetAll() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  const d = defaults();
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, d, { onboarded: true });
  save();
}
