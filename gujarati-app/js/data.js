// Lesson content.
// Each item is [romanized, gujarati script, english, optional note].
// ⚠️ Item IDs are generated from lesson id + position, and progress is saved
// against those IDs — add new items at the END of a lesson, don't reorder.

const RAW = [
  {
    id: 'greet', title: 'Greetings & Basics', emoji: '🙏', color: '#E8590C',
    desc: 'Say hello to everyone — especially Ba.',
    tip: 'Double vowels are long: "aa" sounds like the a in "father", "ee" like "see", "oo" like "moon".',
    lessons: [
      { id: 'greet-1', title: 'Hello & goodbye', items: [
        ['Kem cho?', 'કેમ છો?', 'How are you? / Hi!', 'The classic Gujarati hello. Use it with anyone.'],
        ['Majaa ma', 'મજામાં', "I'm fine", 'The standard reply to "Kem cho?" — literally "in fun / in joy".'],
        ['Jai Shri Krishna', 'જય શ્રી કૃષ્ણ', 'Respectful greeting (to elders)', 'Greet Ba and elders with this. Many Gujarati families use it for both hello and goodbye.'],
        ['Aavjo', 'આવજો', 'Goodbye', 'Literally "please come again" — warmer than a plain bye.'],
        ['Namaste', 'નમસ્તે', 'Hello (formal)'],
      ]},
      { id: 'greet-2', title: 'Yes, no & thank you', items: [
        ['Haa', 'હા', 'Yes'],
        ['Naa', 'ના', 'No'],
        ['Aabhaar', 'આભાર', 'Thank you', 'Many Gujaratis also just say "thank you" in English — both are fine.'],
        ['Maaf karjo', 'માફ કરજો', 'Sorry / Excuse me'],
        ['Saaru', 'સારું', 'Good / Okay'],
        ['Bhale', 'ભલે', 'Alright, sure', 'Say it when Ba asks you to do something. 🙂'],
      ]},
      { id: 'greet-3', title: 'Introducing yourself', items: [
        ['Tamaaru naam shu che?', 'તમારું નામ શું છે?', 'What is your name?'],
        ['Maaru naam Anne che', 'મારું નામ એન છે', 'My name is Anne'],
        ['Tamne maline aanand thayo', 'તમને મળીને આનંદ થયો', 'Nice to meet you'],
        ['Ane tame?', 'અને તમે?', 'And you?'],
        ['Hu shikhu chu', 'હું શીખું છું', "I'm learning", 'Perfect for when you need a little patience from people!'],
        ['Shu?', 'શું?', 'What?'],
      ]},
    ],
  },
  {
    id: 'family', title: 'Family', emoji: '👨‍👩‍👧', color: '#C2255C',
    desc: 'Gujarati has a different word for almost every relative!',
    tip: 'Use "tame" (respectful "you") with elders, and "tu" only with friends, kids and your partner.',
    lessons: [
      { id: 'family-1', title: 'Parents & grandparents', items: [
        ['Ba', 'બા', 'Grandma', 'This is what you call grandma — always with love and respect.'],
        ['Daada', 'દાદા', 'Grandpa'],
        ['Mummy', 'મમ્મી', 'Mom'],
        ['Pappa', 'પપ્પા', 'Dad'],
        ['Parivaar', 'પરિવાર', 'Family'],
        ['Ba, tame kem cho?', 'બા, તમે કેમ છો?', 'Ba, how are you?', '"Tame" is the respectful "you" — always use it with Ba.'],
      ]},
      { id: 'family-2', title: 'Siblings & children', items: [
        ['Bhai', 'ભાઈ', 'Brother'],
        ['Ben', 'બહેન', 'Sister'],
        ['Dikro', 'દીકરો', 'Son'],
        ['Dikri', 'દીકરી', 'Daughter'],
        ['Aa kon che?', 'આ કોણ છે?', 'Who is this?', 'Great for looking at family photos together.'],
        ['Aa maara Ba che', 'આ મારા બા છે', 'This is my Ba'],
      ]},
      { id: 'family-3', title: 'Aunts & uncles', items: [
        ['Kaaka', 'કાકા', "Uncle (dad's brother)"],
        ['Kaaki', 'કાકી', "Aunt (kaka's wife)"],
        ['Maama', 'મામા', "Uncle (mom's brother)"],
        ['Maami', 'મામી', "Aunt (mama's wife)"],
        ['Maasi', 'માસી', "Aunt (mom's sister)"],
        ['Foi', 'ફોઈ', "Aunt (dad's sister)"],
      ]},
      { id: 'family-4', title: 'In-laws', items: [
        ['Saasu', 'સાસુ', 'Mother-in-law'],
        ['Sasra', 'સસરા', 'Father-in-law'],
        ['Pati', 'પતિ', 'Husband'],
        ['Patni', 'પત્ની', 'Wife'],
        ['Sagaa', 'સગા', 'Relatives', 'You will meet a LOT of sagaa at weddings. 😄'],
      ]},
    ],
  },
  {
    id: 'food', title: 'Food & Kitchen', emoji: '🍛', color: '#E67700',
    desc: 'The most important unit. Gujaratis love to feed you!',
    tip: 'When someone offers more food, a polite "bas" (enough) with a smile works wonders.',
    lessons: [
      { id: 'food-1', title: 'At the table', items: [
        ['Rotli', 'રોટલી', 'Flatbread (roti)'],
        ['Daal', 'દાળ', 'Lentil soup'],
        ['Bhaat', 'ભાત', 'Rice'],
        ['Shaak', 'શાક', 'Vegetable curry'],
        ['Chaa', 'ચા', 'Tea'],
        ['Paani', 'પાણી', 'Water'],
      ]},
      { id: 'food-2', title: 'Hungry & full', items: [
        ['Mane bhookh laagi che', 'મને ભૂખ લાગી છે', "I'm hungry"],
        ['Mane taras laagi che', 'મને તરસ લાગી છે', "I'm thirsty"],
        ['Jamva chalo', 'જમવા ચાલો', "Come, let's eat", "You'll hear this a lot!"],
        ['Thodu vadhaare', 'થોડું વધારે', 'A little more'],
        ['Bas, pet bharaai gayu', 'બસ, પેટ ભરાઈ ગયું', "Enough, I'm full", 'Essential survival phrase when Ba keeps serving. 😄'],
      ]},
      { id: 'food-3', title: 'Compliment the cook', items: [
        ['Bahu saras che', 'બહુ સરસ છે', "It's really nice"],
        ['Swaadisht', 'સ્વાદિષ્ટ', 'Delicious'],
        ['Mithu', 'મીઠું', 'Salt / sweet', 'Fun fact: મીઠું means both "salt" and "sweet"!'],
        ['Teekhu', 'તીખું', 'Spicy'],
        ['Mane gamyu', 'મને ગમ્યું', 'I liked it'],
        ['Ba, have bas!', 'બા, હવે બસ!', "Ba, that's enough now!"],
      ]},
    ],
  },
  {
    id: 'numbers', title: 'Numbers & Time', emoji: '🔢', color: '#1971C2',
    desc: 'Count, ask "how much?" and talk about today and tomorrow.',
    tip: '"Be" (2) sounds like "bay", not the English word "be".',
    lessons: [
      { id: 'numbers-1', title: 'One to five', items: [
        ['Ek', 'એક', 'One (1)'],
        ['Be', 'બે', 'Two (2)'],
        ['Tran', 'ત્રણ', 'Three (3)'],
        ['Chaar', 'ચાર', 'Four (4)'],
        ['Paanch', 'પાંચ', 'Five (5)'],
      ]},
      { id: 'numbers-2', title: 'Six to ten', items: [
        ['Chha', 'છ', 'Six (6)'],
        ['Saat', 'સાત', 'Seven (7)'],
        ['Aath', 'આઠ', 'Eight (8)'],
        ['Nav', 'નવ', 'Nine (9)'],
        ['Das', 'દસ', 'Ten (10)'],
      ]},
      { id: 'numbers-3', title: 'When & how much', items: [
        ['Ketla?', 'કેટલા?', 'How many? / How much?'],
        ['Ketla vaagya?', 'કેટલા વાગ્યા?', 'What time is it?'],
        ['Aaje', 'આજે', 'Today'],
        ['Kaale', 'કાલે', 'Tomorrow / Yesterday', 'Kaale means both — the context tells you which!'],
        ['Haji nahi', 'હજી નહીં', 'Not yet'],
      ]},
    ],
  },
  {
    id: 'everyday', title: 'Everyday Talk', emoji: '💬', color: '#2B8A3E',
    desc: 'Phrases that keep a conversation going.',
    tip: 'When you get lost in a conversation, "Dhime bolo" (speak slowly) is your best friend.',
    lessons: [
      { id: 'everyday-1', title: "When you don't understand", items: [
        ['Mane samjaatu nathi', 'મને સમજાતું નથી', "I don't understand"],
        ['Dhime bolo', 'ધીમે બોલો', 'Please speak slowly'],
        ['Farithi bolo', 'ફરીથી બોલો', 'Say it again'],
        ['Mane thodu Gujarati aavde che', 'મને થોડું ગુજરાતી આવડે છે', 'I know a little Gujarati', 'Expect big smiles when you say this!'],
        ['Mane khabar nathi', 'મને ખબર નથી', "I don't know"],
        ['Aa shu che?', 'આ શું છે?', 'What is this?'],
      ]},
      { id: 'everyday-2', title: 'Out and about', items: [
        ['Chalo', 'ચાલો', "Let's go"],
        ['Hu aavu chu', 'હું આવું છું', "I'm coming"],
        ['Tame kyaa jaao cho?', 'તમે ક્યાં જાઓ છો?', 'Where are you going?'],
        ['Ek minute', 'એક મિનિટ', 'One minute'],
        ['Kai vaandho nahi', 'કંઈ વાંધો નહીં', 'No problem'],
        ['Jaldi', 'જલ્દી', 'Quickly / Hurry'],
      ]},
      { id: 'everyday-3', title: 'How I feel', items: [
        ['Hu khush chu', 'હું ખુશ છું', "I'm happy"],
        ['Hu thaaki gai chu', 'હું થાકી ગઈ છું', "I'm tired", '"Gai" is the feminine form — the right one for you, Anne!'],
        ['Mane oongh aave che', 'મને ઊંઘ આવે છે', "I'm sleepy"],
        ['Mane thandi laage che', 'મને ઠંડી લાગે છે', 'I feel cold'],
        ['Mane garmi laage che', 'મને ગરમી લાગે છે', 'I feel hot'],
        ['Chinta na karo', 'ચિંતા ન કરો', "Don't worry"],
      ]},
    ],
  },
  {
    id: 'love', title: 'Sweet Nothings', emoji: '❤️', color: '#E03131',
    desc: 'For the two of you.',
    tip: 'With your partner you can use the casual "tu" instead of "tame".',
    lessons: [
      { id: 'love-1', title: 'Little love phrases', items: [
        ['Hu tane prem karu chu', 'હું તને પ્રેમ કરું છું', 'I love you'],
        ['Mane taari yaad aave che', 'મને તારી યાદ આવે છે', 'I miss you'],
        ['Tu bahu saaro che', 'તું બહુ સારો છે', "You're so sweet (to a guy)", 'To a girl it would be "saari".'],
        ['Jaldi aavje', 'જલ્દી આવજે', 'Come back soon'],
        ['Tu kyaa che?', 'તું ક્યાં છે?', 'Where are you?'],
      ]},
      { id: 'love-2', title: 'Morning & night', items: [
        ['Suprabhaat', 'સુપ્રભાત', 'Good morning', 'A bit formal — at home many people just say "good morning".'],
        ['Shubh raatri', 'શુભ રાત્રિ', 'Good night'],
        ['Chaa banaavu?', 'ચા બનાવું?', 'Shall I make tea?'],
        ['Tu jamyo?', 'તું જમ્યો?', 'Did you eat? (to a guy)', 'In Gujarati families this is how people say "I care about you".'],
        ['Hu thaaki gai, chalo suie', 'હું થાકી ગઈ, ચાલો સૂઈએ', "I'm tired, let's sleep"],
      ]},
    ],
  },
  {
    id: 'festivals', title: 'Festivals & Family Events', emoji: '🪔', color: '#9C36B5',
    desc: 'Diwali, Navratri, kites and blessings.',
    tip: 'Elders love it when you greet them first — it shows respect.',
    lessons: [
      { id: 'festivals-1', title: 'Diwali & New Year', items: [
        ['Diwaali', 'દિવાળી', 'Diwali (festival of lights)'],
        ['Diwaali ni shubhkaamnao', 'દિવાળીની શુભકામનાઓ', 'Happy Diwali'],
        ['Saal Mubaarak', 'સાલ મુબારક', 'Happy New Year', 'The Gujarati New Year is the day after Diwali.'],
        ['Mithaai', 'મીઠાઈ', 'Sweets'],
        ['Divo', 'દીવો', 'Oil lamp'],
      ]},
      { id: 'festivals-2', title: 'Navratri & kites', items: [
        ['Navraatri', 'નવરાત્રિ', 'Festival of nine nights'],
        ['Garba', 'ગરબા', 'Gujarati circle dance', 'Danced in big circles all night during Navratri!'],
        ['Patang', 'પતંગ', 'Kite'],
        ['Kaapyo che!', 'કાપ્યો છે!', 'Cut it!', 'Shouted when you cut someone\'s kite on Uttarayan (January). 🪁'],
        ['Page laagu', 'પગે લાગું', 'I bow to you (touching feet)', "Said while bending to touch an elder's feet — try it with Ba and she'll bless you!"],
      ]},
    ],
  },
];

export const UNITS = RAW.map((u, ui) => ({
  ...u,
  n: ui + 1,
  lessons: u.lessons.map((l) => ({
    ...l,
    unitId: u.id,
    items: l.items.map(([rom, gu, en, note], i) => ({
      id: `${l.id}-${i}`, rom, gu, en, note, unitId: u.id, lessonId: l.id,
    })),
  })),
}));

export const LESSONS = UNITS.flatMap((u) => u.lessons);
export const ALL_ITEMS = LESSONS.flatMap((l) => l.items);
export const ITEMS = Object.fromEntries(ALL_ITEMS.map((i) => [i.id, i]));
export const UNIT_BY_ID = Object.fromEntries(UNITS.map((u) => [u.id, u]));
export const LESSON_BY_ID = Object.fromEntries(LESSONS.map((l) => [l.id, l]));
export const unitPool = (unitId) => ALL_ITEMS.filter((i) => i.unitId === unitId);
