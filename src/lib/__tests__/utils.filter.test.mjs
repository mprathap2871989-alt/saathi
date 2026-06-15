/**
 * Profanity filter tests for containsBlockedContent
 * src/lib/__tests__/utils.filter.test.mjs
 *
 * Run with:   node src/lib/__tests__/utils.filter.test.mjs
 * No test framework needed — plain Node assertions.
 *
 * Suites:
 *   1  — Clean content (false-positive guard)
 *   2  — English profanity (bad-words default list)
 *   3  — Original Hindi custom list (Group 1)
 *   4  — English library-bug fix: wetback (Group 2)
 *   5  — LGBTQ hate slurs (Group 3)
 *   6  — Religious / communal slurs (Group 4)
 *   7  — Hindi variants and compounds (Group 5)
 *   8  — Hinglish abuse terms (Group 6)
 *   9  — Caste-based slurs (Group 7)
 *  10  — Explicitly NOT blocked: identity / community terms
 *  11  — Case insensitivity
 *  12  — Sentence embedding (slur inside longer text)
 *  13  — Edge cases (fail-open)
 */

import { Filter } from "bad-words";

// ── Mirror utils.ts exactly ───────────────────────────────────────────────────
const _filter = new Filter();

_filter.addWords(
  "mc","bc","bhosdike","chutiya","madarchod","bhenchod",
  "randi","harami","kamina","chodu","gaandu","lodu"
);
_filter.addWords("wetback");
_filter.addWords("tranny","poofter","batty boy");
_filter.addWords("katua","kaffir");
_filter.addWords(
  "gandu","haramzada","haramzadi","haraami","haraamkhor","kamine",
  "lund","chut","choot","bhosda","bhosdiwala","laude","lawda",
  "maderchod","madarjaat","rande","randibaaz","bsdk","mkc"
);
_filter.addWords("bhadwa","bhadwi");
_filter.addWords("dhed","chandal","neechi jaat");

function containsBlockedContent(text) {
  try { return _filter.isProfane(text); }
  catch { return false; }
}

// ── Test runner ───────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(label, actual, expected) {
  if (actual === expected) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    console.error(`       expected : ${expected}`);
    console.error(`       received : ${actual}`);
    failed++;
  }
}

function block(label, text) { assert(label, containsBlockedContent(text), true);  }
function pass (label, text) { assert(label, containsBlockedContent(text), false); }

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 — Clean content (false-positive guard)
// Every item here MUST pass through — blocking any of these is a regression.
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 1: Clean content — must NOT be blocked ──");
pass("empty string",                       "");
pass("normal support post",                "I've been feeling really low this week and I don't know who to talk to.");
pass("crisis phrase without slur",         "I feel so alone and I don't want to be here anymore");
pass("'killing it' false-positive guard",  "I'm killing it at work finally");
pass("medical language",                   "My doctor diagnosed me with anxiety and depression");
pass("relationship post",                  "My partner and I broke up after 4 years together");
pass("iCall number mention",               "Please call iCall: 9152987821 if you need help");
pass("Hindi clean sentence",               "Mujhe kuch help chahiye, koi hai?");
pass("Hinglish clean",                     "Sab theek ho jayega yaar, ek din ek dum");
pass("dogs in Hindi — kutte innocent",     "Mere ghar mein do kutte hain aur woh bohot pyaare hain");
pass("female dog in Hindi — kutti",        "Ek kutti paal rakhi hai humne");
pass("Dalit community mention — bhangi",   "The bhangi community has faced discrimination for decades");
pass("Dalit community mention — chamar",   "Chamar artisans have made beautiful leather goods for centuries");
pass("queer as identity",                  "I am queer and I am looking for a safe space to share");
pass("queer academic use",                 "Queer theory challenges binary assumptions");
pass("hijra as identity",                  "The hijra community gathered for a ceremony in the city");
pass("kinnar — official term",             "Kinnar community received legal recognition from the court");
pass("chakka in cricket",                  "Dhoni hit a chakka to win the match in the last over");
pass("sanghi as self-identity",            "I am proud to call myself a sanghi");
pass("jihadi in journalism",               "The jihadi group claimed responsibility according to reports");
pass("long clean post",                    "I've been struggling with work stress for three months. My manager never listens. I feel unheard every single day. Looking for advice from anyone who has been through this.");
pass("Devanagari script",                  "नमस्ते, मुझे मदद चाहिए");
pass("numbers and symbols",                "Feeling 10/10 bad today :(");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 — English profanity (bad-words default list, unchanged)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 2: English profanity (default list) ──");
block("fuck",              "fuck");
block("shit",              "shit");
block("bitch",             "bitch");
block("asshole",           "asshole");
block("bastard",           "bastard");
block("cunt",              "cunt");
block("dick",              "dick");
block("cock",              "cock");
block("pussy",             "pussy");
block("motherfucker",      "motherfucker");
block("whore",             "whore");
block("slut",              "slut");
block("piss",              "piss");
block("retard",            "retard");
block("nigger",            "nigger");
block("nigga",             "nigga");
block("chink",             "chink");
block("kike",              "kike");
block("spic",              "spic");
block("paki",              "paki");
block("fag",               "fag");
block("faggot",            "faggot");
block("dyke",              "dyke");
block("homo",              "homo");
block("lesbo",             "lesbo");
block("shemale",           "shemale");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 — Original Hindi custom list (Group 1, must remain working)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 3: Original Hindi custom list (Group 1) ──");
block("chutiya",           "chutiya mat ban");
block("madarchod",         "madarchod sala");
block("bhenchod",          "bhenchod");
block("harami",            "woh ek harami hai");
block("randi",             "tu randi hai");
block("bhosdike",          "bhosdike");
block("gaandu",            "gaandu");
block("kamina",            "kamina insaan");
block("chodu",             "chodu");
block("lodu",              "lodu");
block("mc",                "mc bc kya kar raha hai");
block("bc",                "bc bol raha hai");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 — English library-bug fix: wetback (Group 2)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 4: English library-bug fix (Group 2) ──");
block("wetback standalone",            "wetback");
block("wetback embedded in sentence",  "he called her a wetback");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 — LGBTQ hate slurs (Group 3)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 5: LGBTQ hate slurs (Group 3) ──");
block("tranny standalone",             "tranny");
block("tranny embedded",               "stop calling people tranny");
block("poofter standalone",            "poofter");
block("poofter embedded",              "he called him a poofter at school");
block("batty boy standalone",          "batty boy");
block("batty boy embedded",            "they shouted batty boy across the street");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 — Religious / communal slurs (Group 4)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 6: Religious / communal slurs (Group 4) ──");
block("katua standalone",              "katua");
block("katua embedded",                "woh katua hai isliye usse mat lo");
block("kaffir standalone",             "kaffir");
block("kaffir embedded",               "he screamed kaffir at the crowd");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 7 — Hindi variants and compounds (Group 5)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 7: Hindi variants and compounds (Group 5) ──");
block("gandu (variant of gaandu)",     "gandu");
block("gandu embedded",                "tu gandu hai yaar");
block("haramzada",                     "haramzada");
block("haramzada embedded",            "woh ek haramzada nikla");
block("haramzadi",                     "haramzadi");
block("haramzadi embedded",            "woh haramzadi mujhe dekh ke muskura rahi thi");
block("haraami (spelling variant)",    "haraami");
block("haraami embedded",              "sala haraami kahin ka");
block("haraamkhor",                    "haraamkhor");
block("haraamkhor embedded",           "ek number ka haraamkhor hai woh");
block("kamine (vocative of kamina)",   "kamine");
block("kamine embedded",               "aye kamine idhar aa");
block("lund",                          "lund");
block("lund embedded",                 "teri maa ka lund");
block("chut",                          "chut");
block("chut embedded",                 "chut maraa apna");
block("choot",                         "choot");
block("choot embedded",                "kya choot hai yeh sab");
block("bhosda",                        "bhosda");
block("bhosda embedded",               "bhosda tere baap ka");
block("bhosdiwala",                    "bhosdiwala");
block("bhosdiwala embedded",           "ek number ka bhosdiwala hai");
block("laude",                         "laude");
block("laude embedded",                "laude ke barabar bhi nahi hai tu");
block("lawda",                         "lawda");
block("lawda embedded",                "sala lawda");
block("maderchod (spelling variant)",  "maderchod");
block("maderchod embedded",            "maderchod kya kar raha hai");
block("madarjaat",                     "madarjaat");
block("madarjaat embedded",            "madarjaat insaan hai woh");
block("rande (variant of randi)",      "rande");
block("rande embedded",                "rande ki tarah ghoom raha hai");
block("randibaaz",                     "randibaaz");
block("randibaaz embedded",            "bada randibaaz nikla yaar");
block("bsdk (abbreviation)",           "bsdk");
block("bsdk embedded",                 "bsdk tu samajhta kya hai");
block("mkc (abbreviation)",            "mkc");
block("mkc embedded",                  "mkc kya bolta hai yeh");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 8 — Hinglish abuse terms (Group 6)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 8: Hinglish abuse terms (Group 6) ──");
block("bhadwa standalone",             "bhadwa");
block("bhadwa embedded",               "woh ek bhadwa hai bas");
block("bhadwi standalone",             "bhadwi");
block("bhadwi embedded",               "woh bhadwi aurat hai");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 9 — Caste-based slurs (Group 7)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 9: Caste-based slurs (Group 7) ──");
block("dhed standalone",               "dhed");
block("dhed embedded",                 "tune dhed bol ke gali di usse");
block("chandal standalone",            "chandal");
block("chandal embedded",              "yeh chandal log kahin ke");
block("neechi jaat (phrase)",          "neechi jaat");
block("neechi jaat embedded",          "tu neechi jaat ka hai isliye chup reh");
block("neechi jaat mid-sentence",      "unhone kaha ki woh neechi jaat se hai");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 10 — Explicitly NOT blocked: identity and community terms
// These must pass — blocking them would harm the users we are here to support.
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 10: Identity / community terms — must NOT be blocked ──");
pass("queer — self-id",                "I identify as queer");
pass("queer — community",              "the queer community needs more support");
pass("hijra — self-id",                "I am hijra and I am proud");
pass("hijra — community ref",          "hijra community has been part of Indian culture for centuries");
pass("kinnar — official term",         "kinnar aadhar card scheme was launched by the government");
pass("chakka — cricket",               "teen chakka maare aaj Rohit ne");
pass("chakka — wheel",                 "gaadi ka chakka puncture ho gaya");
pass("bhangi — community name",        "bhangi samaj ke log sangathan bana rahe hain");
pass("chamar — community name",        "chamar community artisans are demanding fair wages");
pass("kutte — pets",                   "mere do kutte hain, beagle aur labrador");
pass("kutti — female dog",             "kutti ne aaj 4 bachche diye");
pass("sanghi — self-id",               "main khud ek sanghi hoon aur mujhe uss par garv hai");
pass("bhakt — self-id",                "bhakt hoon toh kya, sach bolne se nahi darunga");
pass("jihadi — news context",          "police ne jihadi module ka bhanda phod diya");
pass("kafir — theological use",        "kafir aur momin mein fark hota hai");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 11 — Case insensitivity
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 11: Case insensitivity ──");
block("ASSHOLE all-caps",              "ASSHOLE");
block("Chutiya mixed-case",            "Chutiya");
block("HARAMI all-caps",               "HARAMI");
block("WETBACK all-caps",              "WETBACK");
block("Tranny mixed-case",             "Tranny");
block("KATUA all-caps",                "KATUA");
block("Gandu mixed-case",              "Gandu");
block("CHANDAL all-caps",              "CHANDAL");
block("Bhadwa mixed-case",             "Bhadwa");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 12 — Sentence embedding
// Slurs buried inside longer, realistic post text must still be detected.
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 12: Sentence embedding ──");
block("slur in a post title",          "My colleague keeps calling me a chutiya in front of others");
block("slur in a story paragraph",     "I have been working here for 3 years and my boss calls me haramzada every time I make a mistake. It is really affecting my mental health.");
block("slur at end of sentence",       "I finally stood up to him and he called me a madarchod");
block("slur after punctuation",        "He smiled at me and said: bsdk, tu kya karega mere bina");
block("caste slur in a story",         "My landlord refused to rent to us and said we are neechi jaat");
block("LGBTQ slur in complaint",       "My classmates have been calling me tranny since I came out");
block("communal slur in incident",     "The group surrounded him shouting katua katua");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 13 — Edge cases (fail-open behaviour)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 13: Edge cases (fail-open) ──");
pass("empty string",                   "");
pass("single character",               "a");
pass("only whitespace",                "     ");
pass("only numbers",                   "9152987821");
pass("only punctuation",               "!!! ??? ...");
pass("Devanagari script (clean)",      "नमस्ते दुनिया, मुझे मदद चाहिए");
pass("very long clean string",         "a".repeat(10000));

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────
const total = passed + failed;
console.log(`\n${"─".repeat(60)}`);
console.log(`  Results: ${passed}/${total} passed, ${failed} failed`);
console.log(`${"─".repeat(60)}\n`);
if (failed > 0) process.exit(1);
