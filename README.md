# Kem Cho 🙏: Gujarati for Anne

A small installable web app (PWA) for learning **spoken** Gujarati, built for Anne. It works offline and installs on Android from Chrome, so no app store is needed.

## What's inside

- **Learn**: 7 units, 20 lessons, 110 phrases (greetings, family with *Ba*, food, numbers & time, everyday talk, love phrases, festivals). Each lesson mixes:
  - new phrase cards with audio, a 🐢 slow-playback button and cultural tips
  - "How do you say…?" multiple choice
  - "What does this mean?" listening questions
  - match the pairs
  - build the sentence from word tiles
  - say it out loud: record yourself, then hear your recording followed by the native audio
- **Practice**: spaced-repetition review (words come back right before she'd forget them), plus listening, speaking and quick-quiz drills.
- **Phrases**: a searchable phrasebook, plus a **"From you ❤️"** section where Anne can add her own phrases with voice recordings.
- **Love notes 💌**: surprise notes that unlock with streaks and milestones.
- Streaks, XP, a daily goal, dark mode, and a setting to show or hide the Gujarati script.

Audio uses the phone's built-in Gujarati text-to-speech (`gu-IN`). If there's no sound, open Settings in the app, which has steps for installing the Google Gujarati voice.

## Make it yours ✏️

Edit **`js/personal.js`**:

- `fromName`: your name, used to sign the notes
- `welcome`: the first message she sees
- `phrases`: your own phrases. To add your voice, put an audio file in `audio/` and add `audio: 'audio/file.m4a'`
- `loveNotes`: rewrite these in your own words and change when they unlock

To add lessons or phrases, edit **`js/data.js`**. Add new phrases at the **end** of a lesson so saved progress stays matched to the right phrase.

After changing files, bump `VERSION` in `sw.js` (e.g. `kemcho-v2`) so the installed app picks up the update.

## Run it locally

```bash
cd gujarati-app
python3 -m http.server 8000
# open http://localhost:8000
```

## Put it on her phone

The app has to be served over **HTTPS** for installing, offline mode and the microphone to work. Either of these is free:

1. **GitHub Pages**: in the repo go to *Settings → Pages → Deploy from a branch*, pick the branch and `/ (root)`. The app will be at
   `https://<your-username>.github.io/<repo>/gujarati-app/`
2. **Netlify Drop**: drag the `gujarati-app` folder onto <https://app.netlify.com/drop>.

Then on her Android phone, open the link in **Chrome** and tap **Install**, or use ⋮ → *Add to Home screen*.

Progress is saved on her phone (in browser storage), so it stays separate from any other device.
