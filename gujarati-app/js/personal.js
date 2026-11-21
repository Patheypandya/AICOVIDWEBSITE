// ✏️ Edit this file to make the app yours.
// Everything here is shown to Anne — change the words to sound like you.

export const PERSONAL = {
  learnerName: 'Anne',
  learnerNameGu: 'એન',

  // Your name — shown on love notes and the "From …" phrase section.
  // Leave empty to sign as "with love".
  fromName: '',

  // Shown once, on the very first screen.
  welcome:
    "I made this little app just for you, so you can chat with Ba and the whole family. " +
    "Go slowly, have fun, and don't worry about mistakes — everyone will love that you're trying. ❤️",

  // Your own phrases, shown under "From you" in Phrases.
  // To use your own voice: record an audio file, put it in the /audio folder,
  // and add  audio: 'audio/filename.m4a'  to the phrase.
  // (Anne can also add phrases + recordings right inside the app.)
  phrases: [
    { rom: 'Tu maari jaan che', gu: 'તું મારી જાન છે', en: 'You are my darling', note: 'Say this to me anytime 😉' },
    { rom: 'Tu maari duniya che', gu: 'તું મારી દુનિયા છે', en: 'You are my world' },
  ],

  // Surprise notes that unlock as she learns.
  // unlock: { lessons: N } | { streak: N } | { words: N } | { xp: N }
  loveNotes: [
    { id: 'first', unlock: { lessons: 1 }, title: 'Your very first lesson!',
      text: "You did it! I'm already so proud of you. Ba is going to melt when you say \"Jai Shri Krishna\" to her. 🙏" },
    { id: 'streak3', unlock: { streak: 3 }, title: 'Three days in a row 🔥',
      text: 'Majaa ma? Because I am — watching you learn my language makes me so happy.' },
    { id: 'words25', unlock: { words: 25 }, title: '25 words!',
      text: "That's already enough to make the whole family smile at dinner." },
    { id: 'streak7', unlock: { streak: 7 }, title: 'One whole week!',
      text: 'Seven days straight. Here\'s a phrase just for us: "Tu maari duniya che" — you are my world. 🌍' },
    { id: 'words50', unlock: { words: 50 }, title: '50 words!!',
      text: 'You can officially survive a family dinner. Bas, pet bharaai gayu! 😄' },
    { id: 'streak14', unlock: { streak: 14 }, title: 'Two weeks 💛',
      text: 'Hu tane prem karu chu. I love you — in every language.' },
    { id: 'streak30', unlock: { streak: 30 }, title: '30 days!',
      text: "A whole month. You're amazing. Time to celebrate — you pick what we do next! 💌" },
  ],
};
