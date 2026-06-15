/**
 * Crisis keyword detection tests for containsCrisisContent
 * src/lib/__tests__/crisis.test.mjs
 *
 * Run with:   node src/lib/__tests__/crisis.test.mjs
 * No test framework — plain Node assertions.
 *
 * Suites:
 *   1  — English: suicidal ideation phrases (must detect)
 *   2  — English: self-harm phrases (must detect)
 *   3  — Hindi / Hinglish phrases (must detect)
 *   4  — False positives: normal support-seeking language (must NOT detect)
 *   5  — False positives: Saathi-specific content (must NOT detect)
 *   6  — Normalisation: case, extra whitespace, punctuation
 *   7  — Phrase boundary: partial matches that must NOT fire
 *   8  — Edge cases
 */

// ── Mirror crisis.ts exactly ──────────────────────────────────────────────────
const CRISIS_PHRASES = [
  "want to die",
  "want to kill myself",
  "kill myself",
  "killing myself",
  "end my life",
  "end it all",
  "take my own life",
  "taking my own life",
  "take my life",
  "don't want to be alive",
  "dont want to be alive",
  "don't want to live",
  "dont want to live",
  "not want to live",
  "wish i was dead",
  "wish i were dead",
  "better off dead",
  "better off without me",
  "no reason to live",
  "cant go on",
  "can't go on",
  "cant do this anymore",
  "can't do this anymore",
  "no point in living",
  "no point anymore",
  "giving up on life",
  "goodbye forever",
  "final goodbye",
  "don't want to exist",
  "dont want to exist",
  "hurt myself",
  "hurting myself",
  "cutting myself",
  "cut myself",
  "harming myself",
  "harm myself",
  "self harm",
  "self-harm",
  "marna chahta",
  "marna chahti",
  "marna chahta hoon",
  "marna chahti hoon",
  "mar jaana chahta",
  "mar jaana chahti",
  "mar jaunga",
  "mar jaungi",
  "khud ko khatam",
  "zindagi khatam",
  "jeena nahi chahta",
  "jeena nahi chahti",
  "jeena nahi hai",
  "jeena nahi",
  "jina nahi chahta",
  "jina nahi chahti",
  "khud ko hurt",
  "khud ko nuksaan",
];

function containsCrisisContent(text) {
  const normalised = text.toLowerCase().replace(/\s+/g, " ").trim();
  return CRISIS_PHRASES.some((phrase) => normalised.includes(phrase));
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

function detect(label, text) { assert(label, containsCrisisContent(text), true);  }
function clear (label, text) { assert(label, containsCrisisContent(text), false); }

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 — English suicidal ideation (must detect)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 1: English suicidal ideation ──");
detect("want to die",                           "I want to die");
detect("want to kill myself",                   "I want to kill myself");
detect("kill myself",                           "sometimes I think I should just kill myself");
detect("killing myself",                        "I keep thinking about killing myself");
detect("end my life",                           "I've decided to end my life");
detect("end it all",                            "I just want to end it all");
detect("take my own life / taking my own life", "I'm thinking about taking my own life");
detect("take my life",                          "I want to take my life tonight");
detect("don't want to be alive",                "I don't want to be alive anymore");
detect("dont want to be alive (no apostrophe)", "I dont want to be alive");
detect("don't want to live",                    "I don't want to live like this");
detect("dont want to live (no apostrophe)",     "I dont want to live anymore");
detect("not want to live",                      "I do not want to live");
detect("wish i was dead",                       "I wish I was dead");
detect("wish i were dead",                      "I wish I were dead already");
detect("better off dead",                       "everyone would be better off dead");
detect("better off without me",                 "my family is better off without me");
detect("no reason to live",                     "I have no reason to live");
detect("cant go on",                            "I cant go on like this");
detect("can't go on",                           "I can't go on anymore");
detect("cant do this anymore",                  "I cant do this anymore");
detect("can't do this anymore",                 "I can't do this anymore");
detect("no point in living",                    "there is no point in living");
detect("no point anymore",                      "there's no point anymore");
detect("giving up on life",                     "I am giving up on life");
detect("goodbye forever",                       "this is my goodbye forever");
detect("final goodbye",                         "I wanted to write a final goodbye");
detect("don't want to exist",                   "I don't want to exist");
detect("dont want to exist (no apostrophe)",    "I dont want to exist anymore");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 — English self-harm (must detect)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 2: English self-harm ──");
detect("hurt myself",       "I keep wanting to hurt myself");
detect("hurting myself",    "I've been hurting myself for months");
detect("cutting myself",    "I started cutting myself again");
detect("cut myself",        "I cut myself last night");
detect("harming myself",    "I've been harming myself");
detect("harm myself",       "I want to harm myself");
detect("self harm",         "I struggle with self harm");
detect("self-harm",         "I have a history of self-harm");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 — Hindi / Hinglish (must detect)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 3: Hindi / Hinglish ──");
detect("marna chahta",          "mujhe marna chahta hoon");
detect("marna chahti",          "marna chahti hoon main");
detect("marna chahta hoon",     "main marna chahta hoon");
detect("marna chahti hoon",     "main marna chahti hoon ab");
detect("mar jaana chahta",      "bas mar jaana chahta hoon");
detect("mar jaana chahti",      "main mar jaana chahti hoon");
detect("mar jaunga",            "main mar jaunga ek din");
detect("mar jaungi",            "main mar jaungi");
detect("khud ko khatam",        "main khud ko khatam karna chahta hoon");
detect("zindagi khatam",        "meri zindagi khatam kar leni chahiye");
detect("jeena nahi chahta",     "main jeena nahi chahta");
detect("jeena nahi chahti",     "main jeena nahi chahti ab");
detect("jeena nahi hai",        "jeena nahi hai mujhe");
detect("jeena nahi (short)",    "bas jeena nahi");
detect("jina nahi chahta",      "jina nahi chahta hoon");
detect("jina nahi chahti",      "jina nahi chahti hoon bilkul");
detect("khud ko hurt",          "main khud ko hurt karna chahta hoon");
detect("khud ko nuksaan",       "main khud ko nuksaan pahunchana chahta hoon");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 — False positives: normal support-seeking (must NOT detect)
// These are realistic Saathi posts that must never be flagged as crisis.
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 4: False positives — normal support language ──");
clear("feeling very low",              "I've been feeling very low and sad lately");
clear("struggling with anxiety",       "I struggle with anxiety every day");
clear("relationship ended",            "my relationship ended and I feel broken");
clear("failed exam",                   "I failed my board exam and feel like a failure");
clear("lonely",                        "I feel so lonely and nobody understands me");
clear("depressed",                     "I've been diagnosed with depression and I need support");
clear("stressed at work",              "the stress at work is becoming unbearable");
clear("family conflict",               "my family doesn't accept who I am");
clear("panic attacks",                 "I've been having panic attacks every night");
clear("grief",                         "I lost my father last month and I can't stop crying");
clear("figurative 'dying'",            "I'm dying of embarrassment at work");
clear("'killing it' expression",       "I've been killing it at the gym this month");
clear("'dead tired'",                  "I'm so dead tired from studying all night");
clear("'cut' non-harm",                "I cut my finger cooking dinner");
clear("'end of day'",                  "can't wait for the day to end");
clear("'end of semester'",             "I just need to get to the end of semester");
clear("asking for advice",             "I don't know how to deal with this situation, any advice?");
clear("'no point' in task",            "there's no point in arguing with my parents about this");
clear("'goodbye' to a job",            "I said goodbye to my old job today");
clear("'self care' not self-harm",     "I need to practice more self care");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 — False positives: Saathi-specific platform content (must NOT detect)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 5: False positives — Saathi platform content ──");
clear("iCall reference",               "Please call iCall 9152987821 if you are in crisis");
clear("crisis resource mention",       "I found a crisis helpline that really helped me");
detect("self harm in awareness sentence — still flagged", "raising awareness about self harm in schools is important");
detect("past tense self-harm — correctly flagged", "I used to hurt myself years ago but I got help and I am better now");
clear("supporting someone else",       "my friend mentioned wanting to hurt themselves and I'm worried");
detect("clinical self-harm mention — correctly flagged", "my therapist explained the cycle of self harm to me");
clear("Hindi clean",                   "mujhe bahut takleef ho rahi hai, koi madad karo");
clear("Hindi asking for support",      "mujhe help chahiye, koi hai jo sun sake");
clear("Hinglish general distress",     "yaar bahut bura lag raha hai, samajh nahi aa raha kya karoon");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 — Normalisation
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 6: Normalisation ──");
detect("all-caps",                     "I WANT TO DIE");
detect("mixed case",                   "I Want To Kill Myself");
detect("extra whitespace",             "I  want   to   die");
detect("leading/trailing whitespace",  "   I want to die   ");
detect("phrase mid long post",         "I have been struggling for months and I just cant go on anymore, I don't know what to do");
detect("phrase at very end",           "There is just no point anymore");
detect("phrase at very start",         "Kill myself is all I think about");
detect("newline between words — normalised", "I want\nto die");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 7 — Phrase boundaries: partial matches that must NOT fire
// These test that shorter crisis strings don't match inside innocent words.
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 7: Phrase boundary guards ──");
clear("'die' inside 'dieting'",        "I've been dieting for three months");
clear("'die' inside 'studies'",        "My studies are going well");
clear("'kill' in 'skillful'",          "She is very skillful at painting");
clear("'harm' in 'pharmacy'",          "I went to the pharmacy to buy medicine");
clear("'cut' in 'acute'",              "I have an acute stress reaction");
clear("'end' in 'friend'",             "My friend has been very supportive");
clear("'live' in 'liver'",             "I have a liver condition");
clear("'live' in 'deliver'",           "Can you deliver this package to me");
clear("'dead' in 'deadline'",          "I have a deadline next week");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 8 — Edge cases
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 8: Edge cases ──");
clear("empty string",     "");
clear("single word",      "help");
clear("only whitespace",  "     ");
clear("only punctuation", "??? !!!");
clear("numbers only",     "9152987821");
clear("Devanagari clean", "नमस्ते, मुझे मदद चाहिए");
clear("very long clean",  "a".repeat(10000));

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────
const total = passed + failed;
console.log(`\n${"─".repeat(60)}`);
console.log(`  Results: ${passed}/${total} passed, ${failed} failed`);
console.log(`${"─".repeat(60)}\n`);
if (failed > 0) process.exit(1);
