// Audio: text-to-speech in Gujarati (gu-IN), recorded audio files, and the microphone recorder.
import { state } from './store.js';

export const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
export const recSupported = !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

let voices = [];
export function initSpeech() {
  if (!ttsSupported) return;
  const load = () => { voices = speechSynthesis.getVoices(); };
  load();
  speechSynthesis.addEventListener?.('voiceschanged', load);
}

export function guVoice() {
  return voices.find((v) => /^gu([-_]|$)/i.test(v.lang));
}

let current = null;
export function stopAudio() {
  if (current) { current.pause(); current = null; }
  if (ttsSupported) speechSynthesis.cancel();
}

export function speak(text, rate) {
  if (!ttsSupported || !text) return;
  stopAudio();
  const u = new SpeechSynthesisUtterance(text);
  const v = guVoice();
  u.lang = v ? v.lang : 'gu-IN';
  if (v) u.voice = v;
  u.rate = rate ?? state.settings.rate;
  speechSynthesis.speak(u);
}

/** Play an item: its own recording if it has one, otherwise Gujarati TTS. */
export function playItem(item, { slow = false } = {}) {
  if (!item) return;
  stopAudio();
  if (item.audioUrl || item.audio) {
    const a = new Audio(item.audioUrl || item.audio);
    a.playbackRate = slow ? 0.75 : 1;
    current = a;
    a.play().catch(() => speak(item.gu || item.rom));
    return;
  }
  speak(item.gu || item.rom, slow ? 0.55 : undefined);
}

export class Recorder {
  static active = null;

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.chunks = [];
    this.mr = new MediaRecorder(this.stream);
    this.mr.ondataavailable = (e) => { if (e.data.size) this.chunks.push(e.data); };
    this.done = new Promise((resolve) => {
      this.mr.onstop = () => {
        this.stream.getTracks().forEach((t) => t.stop());
        resolve(new Blob(this.chunks, { type: this.mr.mimeType || 'audio/webm' }));
      };
    });
    this.mr.start();
    Recorder.active = this;
    this.timer = setTimeout(() => this.onAutoStop?.(), 10000);
  }

  stop() {
    clearTimeout(this.timer);
    if (this.mr?.state === 'recording') this.mr.stop();
    if (Recorder.active === this) Recorder.active = null;
    return this.done;
  }

  static stopAll() { Recorder.active?.stop(); }
}
