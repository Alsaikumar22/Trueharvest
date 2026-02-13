
import type { BibleData, SongData, Event, User, BiblePlan } from '../types';

export const USERS: User[] = [
  { 
      email: 'member@gmail.com', 
      role: 'user', 
      password: 'password123',
      profile: {
          displayName: 'Faithful Member',
          bio: 'Seeking God daily in the harvest.',
          notificationsEnabled: true,
          streak: 12,
          versesRead: 150,
          avatar: 'bg-blue-500'
      } 
  },
  { 
      email: 'trueharverst@gmail.com', 
      role: 'admin', 
      password: 'harvest2024',
      profile: {
          displayName: 'True Harvest Admin',
          bio: 'Shepherd of the digital flock.',
          notificationsEnabled: true,
          streak: 365,
          versesRead: 5000,
          avatar: 'bg-amber-500'
      } 
  },
];

export const EXIT_VERSES = [
    { text: "The LORD bless you and keep you; the LORD make his face shine on you and be gracious to you.", ref: "Numbers 6:24-25" },
    { text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.", ref: "John 14:27" },
    { text: "I am with you always, even to the end of the age.", ref: "Matthew 28:20" },
    { text: "Come to me, all you who are weary and burdened, and I will give you rest.", ref: "Matthew 11:28" },
    { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.", ref: "Joshua 1:9" },
    { text: "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.", ref: "Philippians 4:7" },
    { text: "Cast all your anxiety on him because he cares for you.", ref: "1 Peter 5:7" },
    { text: "The LORD is my shepherd, I lack nothing. He makes me lie down in green pastures.", ref: "Psalm 23:1-2" }
];

export const BIBLE_VERSION_IDS: Record<string, number> = {
    'english-KJV': 1,
    'english-NKJV': 114,
    'english-ESV': 59,
    'english-NASB': 100,
    'telugu': 1690,
    'tamil': 19,
    'hindi': 1686,
    'kannada': 1687,
    'malayalam': 1688,
};

export const BIBLE_BOOK_CODES: Record<string, string> = {
    'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
    'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
    '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH', 'Ezra': 'EZR',
    'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB', 'Psalm': 'PSA', 'Proverbs': 'PRO',
    'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA', 'Jeremiah': 'JER',
    'Lamentations': 'LAM', 'Ezekiel': 'EZE', 'Daniel': 'DAN', 'Hosea': 'HOS', 'Joel': 'JOE',
    'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON', 'Micah': 'MIC', 'Nahum': 'NAM',
    'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG', 'Zechariah': 'ZEC', 'Malachi': 'MAL',
    'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT',
    'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO', 'Galatians': 'GAL',
    'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL', '1 Thessalonians': '1TH',
    '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI', 'Titus': 'TIT',
    'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS', '1 Peter': '1PE', '2 Peter': '2PE',
    '1 John': '1JN', '2 John': '2JN', '3 John': '3JN', 'Jude': 'JUD', 'Revelation': 'REV'
};

export const BIBLE_PLANS: BiblePlan[] = [
    {
        id: 'new_testament_90',
        title: 'New Testament in 90 Days',
        description: 'Read through the entire New Testament in just 3 months.',
        days: 90,
        imageUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=2670&auto=format&fit=crop',
        schedule: Array.from({ length: 90 }, (_, i) => ({
            day: i + 1,
            reference: i < 28 ? `Matthew ${i+1}` : `Mark ${i-27}`, 
            completed: false
        }))
    }
];

interface BookMetadata {
  en: string;
  te: string;
  ta: string;
  hi?: string;
  kn?: string;
  ml?: string;
  chapters: number;
  group: string;
}

export const BIBLE_METADATA: BookMetadata[] = [
  { en: 'Genesis', te: 'ఆదికాండము', ta: 'ஆதியாகமம்', hi: 'उत्पत्ति', kn: 'ಆದಿಕಾಂಡ', ml: 'ഉല്പത്തി', chapters: 50, group: 'Pentateuch' },
  { en: 'Exodus', te: 'నిర్గమకాండము', ta: 'யாத்திராகமம்', hi: 'निर्गमन', kn: 'ವಿಮೋಚನಕಾಂಡ', ml: 'പുറപ്പാട്', chapters: 40, group: 'Pentateuch' },
  { en: 'Leviticus', te: 'లేవీయకాండము', ta: 'லேவியராகமம்', hi: 'लैव्यवस्था', kn: 'ಯಾಜಕಕಾಂಡ', ml: 'ലേവ്യപുസ്തകം', chapters: 27, group: 'Pentateuch' },
  { en: 'Numbers', te: 'సంఖ్యాకాండము', ta: 'எண்ணாகமம்', hi: 'गिनती', kn: 'ಅರಣ್ಯಕಾಂಡ', ml: 'സംഖ്യാപുസ്തകം', chapters: 36, group: 'Pentateuch' },
  { en: 'Deuteronomy', te: 'ద్వితీయోపదేశకాండము', ta: 'உபாகமம்', hi: 'व्यवस्थाविवरण', kn: 'ಧರ್ಮೋಪದೇಶಕಾಂಡ', ml: 'ആവർത്തനം', chapters: 34, group: 'Pentateuch' },
  { en: 'Joshua', te: 'యెహోషువ', ta: 'யோசுவா', hi: 'यहोशू', kn: 'ಯೆಹೋಶುವ', ml: 'യോശുവ', chapters: 24, group: 'History' },
  { en: 'Judges', te: 'న్యాయాధిపతులు', ta: 'நியாயாதிபதிகள்', hi: 'न्यायियों', kn: 'ನ್ಯಾಯಾಧಿಪತಿಗಳು', ml: 'ന്യായാധിപന്മാർ', chapters: 21, group: 'History' },
  { en: 'Ruth', te: 'రూతు', ta: 'ரூத்', hi: 'रूत', kn: 'ರೂತಳು', ml: 'രൂത്ത്', chapters: 4, group: 'History' },
  { en: '1 Samuel', te: '1 సమూయేలు', ta: '1 சாமுவேல்', hi: '1 शमूएल', kn: '1 ಸಮುವೇಲನು', ml: '1 ശമൂവേൽ', chapters: 31, group: 'History' },
  { en: '2 Samuel', te: '2 సమూయేలు', ta: '2 சாமுવેల్', hi: '2 शमूएल', kn: '2 ಸಮುವೇಲನು', ml: '2 ശമൂവേൽ', chapters: 24, group: 'History' },
  { en: '1 Kings', te: '1 రాజులు', ta: '1 இராஜாக்கள்', hi: '1 राजा', kn: '1 ಅರಸುಗಳು', ml: '1 രാജാക്കന്മാർ', chapters: 22, group: 'History' },
  { en: '2 Kings', te: '2 రాజులు', ta: '2 இராஜாக்கள்', hi: '2 राजा', kn: '2 ಅರಸುಗಳು', ml: '2 രാജാക്കന്മാർ', chapters: 25, group: 'History' },
  { en: '1 Chronicles', te: '1 దినవృత్తాంతములు', ta: '1 நாளாகமம்', hi: '1 इतिहास', kn: '1 ಪೂರ್ವಕಾಲವೃತ್ತಾಂತ', ml: '1 ദിനവൃത്താന്തം', chapters: 29, group: 'History' },
  { en: '2 Chronicles', te: '2 దినవృత్తాంతములు', ta: '2 நாளாகமம்', hi: '2 इतिहास', kn: '2 ಪೂರ್ವಕಾಲವೃತ್ತಾಂತ', ml: '2 ദിനവൃത്താന്തം', chapters: 36, group: 'History' },
  { en: 'Ezra', te: 'ఎజ్రా', ta: 'எஸ்றா', hi: 'एज्रा', kn: 'ಎಜ್ರನು', ml: 'എസ്രാ', chapters: 10, group: 'History' },
  { en: 'Nehemiah', te: 'నెహెమ్యా', ta: 'நெகேமியா', hi: 'नहेमायाह', kn: 'ನೆಹೆಮೀಯನು', ml: 'നെഹെമ്യാവു', chapters: 13, group: 'History' },
  { en: 'Esther', te: 'ఎస్తేరు', ta: 'எஸ்தர்', hi: 'एस्तेर', kn: 'ಎಸ್ತೇರಳು', ml: 'എസ്ഥേർ', chapters: 10, group: 'History' },
  { en: 'Job', te: 'యోబు', ta: 'யோபு', hi: 'अय्यूब', kn: 'ಯೋಬನು', ml: 'ഇയ്യോബ്', chapters: 42, group: 'Poetry' },
  { en: 'Psalm', te: 'కీర్తనల గ్రంథము', ta: 'சங்கீதம்', hi: 'भजन संहिता', kn: 'ಕೀರ್ತನೆಗಳು', ml: 'സങ്കീർത്തനങ്ങൾ', chapters: 150, group: 'Poetry' },
  { en: 'Proverbs', te: 'సామెతలు', ta: 'நீதிமொழிகள்', hi: 'नीतिवचन', kn: 'ಜ್ಞಾನೋಕ್ತಿಗಳು', ml: 'സദൃശവാക്യങ്ങൾ', chapters: 31, group: 'Poetry' },
  { en: 'Ecclesiastes', te: 'ప్రసంగి', ta: 'பிரசங்கி', hi: 'सभोपदेशक', kn: 'ಪ್ರಸಂಗಿ', ml: 'സഭാപ്രസംഗി', chapters: 12, group: 'Poetry' },
  { en: 'Song of Solomon', te: 'పరమగీతము', ta: 'உன்னதப்பாட்டு', hi: 'श्रेष्ठगीत', kn: 'ಪರಮಗೀತ', ml: 'ഉത്തമഗീതം', chapters: 8, group: 'Poetry' },
  { en: 'Isaiah', te: 'యెషయా', ta: 'ஏசாயா', hi: 'यषायाह', kn: 'ಯೆಶಾಯನು', ml: 'യെശയ്യാവു', chapters: 66, group: 'Major Prophets' },
  { en: 'Jeremiah', te: 'యిర్మీయా', ta: 'எரேமியா', hi: 'यिर्मयाह', kn: 'ಯೆರೆಮೀಯನು', ml: 'യിരെമ്യാവു', chapters: 52, group: 'Major Prophets' },
  { en: 'Lamentations', te: 'విలాపవాక్యములు', ta: 'புலம்பல்', hi: 'विलापगीत', kn: 'ಪ್ರಲಾಪಗಳು', ml: 'വിലാപങ്ങൾ', chapters: 5, group: 'Major Prophets' },
  { en: 'Ezekiel', te: 'యెహెజ్కేలు', ta: 'எசேக்கியேல்', hi: 'यहेजकेल', kn: 'ಯೆಹೆಜ್ಕೇಲನು', ml: 'യെഹെസ്കേൽ', chapters: 48, group: 'Major Prophets' },
  { en: 'Daniel', te: 'దానియేలు', ta: 'தானியேல்', hi: 'दानिय्येल', kn: 'ದಾನಿಯೇಲನು', ml: 'ദാനിയേൽ', chapters: 12, group: 'Major Prophets' },
  { en: 'Hosea', te: 'హోషేయ', ta: 'ஓசியா', hi: 'होशे', kn: 'ಹೋಶೇಯನು', ml: 'ഹോശേയ', chapters: 14, group: 'Minor Prophets' },
  { en: 'Joel', te: 'యోవేలు', ta: 'యోவேல்', hi: 'योएल', kn: 'ಯೋವೇಲನು', ml: 'യോവേൽ', chapters: 3, group: 'Minor Prophets' },
  { en: 'Amos', te: 'ఆమోసు', ta: 'ஆமோஸ்', hi: 'आमोस', kn: 'ಆಮೋಸನು', ml: 'ആമോസ്', chapters: 9, group: 'Minor Prophets' },
  { en: 'Obadiah', te: 'ఓబద్యా', ta: 'ஒபதியா', hi: 'ओबद्दाह', kn: 'ಓಬದ್ಯನು', ml: 'ഓബദ്യാവു', chapters: 1, group: 'Minor Prophets' },
  { en: 'Jonah', te: 'యోనా', ta: 'யோனா', hi: 'योना', kn: 'ಯೋನನು', ml: 'യോനാ', chapters: 4, group: 'Minor Prophets' },
  { en: 'Micah', te: 'మీకా', ta: 'மீகா', hi: 'मीका', kn: 'ಮೀಕಾಯನು', ml: 'മീഖാ', chapters: 7, group: 'Minor Prophets' },
  { en: 'Nahum', te: 'నహూము', ta: 'நாகூம்', hi: 'नहूम', kn: 'ನಹೂಮನನು', ml: 'നഹൂം', chapters: 3, group: 'Minor Prophets' },
  { en: 'Habakkuk', te: 'హబక్కూకు', ta: 'ஆபகூக்', hi: 'हबक्कूक', kn: 'ಹಬಕ್ಕೂಕನು', ml: 'ಹಬಕ್ಕೂಕ್', chapters: 3, group: 'Minor Prophets' },
  { en: 'Zephaniah', te: 'జెఫన్యా', ta: 'செப்பனியா', hi: 'सपन्याह', kn: 'ಚೆಫನ್ಯನು', ml: 'സെഫന്യാവു', chapters: 3, group: 'Minor Prophets' },
  { en: 'Haggai', te: 'హగ్గయి', ta: 'ஆகாய்', hi: 'हाग्गै', kn: 'ಹಗ್ಗಾಯನು', ml: 'ഹഗ്ഗായി', chapters: 2, group: 'Minor Prophets' },
  { en: 'Zechariah', te: 'జెకర్యా', ta: 'சகரியா', hi: 'जकर्याह', kn: 'ಜೆಕರ್ಯನು', ml: 'സെഖര്യാവു', chapters: 14, group: 'Minor Prophets' },
  { en: 'Malachi', te: 'మలాకీ', ta: 'மல்கியா', hi: 'मलाकी', kn: 'ಮಲಾಕಿಯನು', ml: 'മലാಖി', chapters: 4, group: 'Minor Prophets' },
  { en: 'Matthew', te: 'మత్తయి', ta: 'மத்தேயு', hi: 'मत्ती', kn: 'ಮತ್ತಾಯನು', ml: 'മत्ती', chapters: 28, group: 'Gospels' },
  { en: 'Mark', te: 'మార్కు', ta: 'மாற்கு', hi: 'मरकुस', kn: 'ಮಾರ್ಕನು', ml: 'ಮರ್ക്കൊಸ್', chapters: 16, group: 'Gospels' },
  { en: 'Luke', te: 'లూకా', ta: 'லூக்கா', hi: 'लूका', kn: 'ಲೂಕನು', ml: 'ലൂക്കൊസ്', chapters: 24, group: 'Gospels' },
  { en: 'John', te: 'యోహాను', ta: 'யோவான்', hi: 'यूहन्ना', kn: 'ಯೋಹಾನನು', ml: 'യോഹന്നാൻ', chapters: 21, group: 'Gospels' },
  { en: 'Acts', te: 'అపొస్తలుల కార్యములు', ta: 'அப்போஸ்தலருடைய நடபடிகள்', hi: 'प्रेरितों के काम', kn: 'ಅಪೊಸ್ತಲರ ಕೃತ್ಯಗಳು', ml: 'പ്രവൃത്തികൾ', chapters: 28, group: 'History' },
  { en: 'Romans', te: 'రోమీయులకు', ta: 'ரோமர்', hi: 'रोमियो', kn: 'ರೋಮಾಪುರದವರಿಗೆ', ml: 'റോಮർ', chapters: 16, group: 'Epistles' },
  { en: '1 Corinthians', te: '1 కొరింథీయులకు', ta: '1 కొரிந்தியர்', hi: '1 कुरिन्थियों', kn: '1 ಕೊರಿಂಥದವರಿಗೆ', ml: '1 കൊരിന്ത്യർ', chapters: 16, group: 'Epistles' },
  { en: '2 Corinthians', te: '2 కొరింథీయులకు', ta: '2 కొரிந்தியர்', hi: '2 कुरिन्थियों', kn: '2 ಕೊರಿಂಥದವರಿಗೆ', ml: '2 കൊരിന്ത്യർ', chapters: 13, group: 'Epistles' },
  { en: 'Galatians', te: 'గలతీయులకు', ta: 'கலாத்தியர்', hi: 'गलातियों', kn: 'ಗಲಾತ್ಯದವರಿಗೆ', ml: 'ഗലാത്യർ', chapters: 6, group: 'Epistles' },
  { en: 'Ephesians', te: 'ఎఫెసీయులకు', ta: 'எபேசியர்', hi: 'इफिसियों', kn: 'ಎಫೆಸದವರಿಗೆ', ml: 'എഫെസ്യർ', chapters: 6, group: 'Epistles' },
  { en: 'Philippians', te: 'ఫిలిప్పీయులకు', ta: 'பிலிப்பியர்', hi: 'फिलिप्पियों', kn: 'ಫಿಲಿಪ್ಪಿಯವರಿಗೆ', ml: 'ಫിലിപ്പിയർ', chapters: 4, group: 'Epistles' },
  { en: 'Colossians', te: 'కొలొస్సయులకు', ta: 'கொலோசெயர்', hi: 'कुलुस्सियों', kn: 'ಕೊಲೊಸ್ಸೆಯವರಿಗೆ', ml: 'കൊലോസ്യർ', chapters: 4, group: 'Epistles' },
  { en: '1 Thessalonians', te: '1 థెస్సలొనీకయులకు', ta: '1 தெசலோனிக்கேயர்', hi: '1 थिस्सलुनीकियों', kn: '1 ಥೆಸಲೊನೀಕದವರಿಗೆ', ml: '1 തെസ്സലോനിക്യർ', chapters: 5, group: 'Epistles' },
  { en: '2 Thessalonians', te: '2 థెస్సలొనీకయులకు', ta: '2 தெசலோனிக்கேயர்', hi: '2 थिस्सलुनीकियों', kn: '2 ಥೆಸಲೊನೀಕದವರಿಗೆ', ml: '2 തെസ്സലോനിക്യർ', chapters: 3, group: 'Epistles' },
  { en: '1 Timothy', te: '1 తిమోతికి', ta: '1 தீமோத்தேயு', hi: '1 तीमुथियुस', kn: '1 ತಿಮೊಥೆಯನಿಗೆ', ml: '1 തിമൊഥെയൊസ്', chapters: 6, group: 'Epistles' },
  { en: '2 Timothy', te: '2 తిమోతికి', ta: '2 தீமோத்தேயு', hi: '2 तीમુथિયुસ', kn: '2 ತಿಮೊಥೆಯನಿಗೆ', ml: '2 ತಿಮೊಥെയൊസ്', chapters: 4, group: 'Epistles' },
  { en: 'Titus', te: 'తీతుకు', ta: 'தீத்து', hi: 'तीतुस', kn: 'ತೀತನಿಗೆ', ml: 'തീത്തൊസ്', chapters: 3, group: 'Epistles' },
  { en: 'Philemon', te: 'ఫిలేమోనుకు', ta: 'பிலேமோன்', hi: 'फिलेमोन', kn: 'ಫಿಲೆಮೋನನಿಗೆ', ml: 'ಫിലേമോൻ', chapters: 1, group: 'Epistles' },
  { en: 'Hebrews', te: 'హెబ్రీయులకు', ta: 'எபிரெயர்', hi: 'इब्रानियों', kn: 'ಇಬ್ರಿಯರಿಗೆ', ml: 'എബ്രായർ', chapters: 13, group: 'Epistles' },
  { en: 'James', te: 'యాకోబు', ta: 'யாக்கோபு', hi: 'याकूब', kn: 'ಯಾಕೋಬನು', ml: 'യാക്കോബ്', chapters: 5, group: 'Epistles' },
  { en: '1 Peter', te: '1 పేతురు', ta: '1 பேதுரு', hi: '1 पतरस', kn: '1 ಪೇತ್ರನು', ml: '1 ಪത്രൊസ്', chapters: 5, group: 'Epistles' },
  { en: '2 Peter', te: '2 పేతురు', ta: '2 பேதுரு', hi: '2 पतरस', kn: '2 ಪೇತ್ರನು', ml: '2 ಪത്രൊസ്', chapters: 3, group: 'Epistles' },
  { en: '1 John', te: '1 యోహాను', ta: '1 யோவான்', hi: '1 यूहन्ना', kn: '1 ಯೋಹಾನನು', ml: '1 യോഹന്നാൻ', chapters: 5, group: 'Epistles' },
  { en: '2 John', te: '2 యోహాను', ta: '2 யோவான்', hi: '2 यूஹன்னா', kn: '2 ಯೋಹಾನನು', ml: '2 യോഹന്നാൻ', chapters: 1, group: 'Epistles' },
  { en: '3 John', te: '3 యోహాను', ta: '3 யோவான்', hi: '3 यूहन्ना', kn: '3 ಯೋಹಾನನು', ml: '3 യോഹന്നാൻ', chapters: 1, group: 'Epistles' },
  { en: 'Jude', te: 'యూదా', ta: 'யூதா', hi: 'यहूदा', kn: 'ಯೂದನು', ml: 'യൂദാ', chapters: 1, group: 'Epistles' },
  { en: 'Revelation', te: 'ప్రకటన గ్రంథము', ta: 'வெளிப்படுத்தின விசேஷம்', hi: 'प्रकाशित वाक्य', kn: 'ಪ್ರಕಟನೆ', ml: 'വെളിപ്പാട്', chapters: 22, group: 'Prophecy' },
];

export const BOOK_METADATA_MAP: Record<string, BookMetadata> = {};
BIBLE_METADATA.forEach(book => {
    BOOK_METADATA_MAP[book.en] = book;
    BOOK_METADATA_MAP[book.te] = book;
    BOOK_METADATA_MAP[book.ta] = book;
    if (book.hi) BOOK_METADATA_MAP[book.hi] = book;
    if (book.kn) BOOK_METADATA_MAP[book.kn] = book;
    if (book.ml) BOOK_METADATA_MAP[book.ml] = book;
});

export const BIBLE_BOOK_GROUPS_EN: Record<string, string[]> = {};
BIBLE_METADATA.forEach(book => {
    if (!BIBLE_BOOK_GROUPS_EN[book.group]) {
        BIBLE_BOOK_GROUPS_EN[book.group] = [];
    }
    BIBLE_BOOK_GROUPS_EN[book.group].push(book.en);
});

export const BIBLE_DATA: BibleData = {
  english: { KJV: {}, NKJV: {}, ESV: {}, NASB: {}, NIV: {}, NLT: {}, ASV: {}, EHV: {}, AKJV: {}, AMP: {} },
  telugu: {},
  tamil: {}
};

export const SONG_DATA: SongData = { 'Praise & Worship': { 'English': [] } };
export const EVENTS: Event[] = [];
