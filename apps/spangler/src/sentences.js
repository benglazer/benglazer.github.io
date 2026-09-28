import { CONTEXTS } from "./data/contexts.js";

const SPANISH_SUBJECTS = ["", "", "ella", "", "", "ellos"];

const SPANISH_POSSESSIVES = {
  mi: ["mi", "tu", "su", "nuestro", "vuestro", "su"],
  "mi:f": ["mi", "tu", "su", "nuestra", "vuestra", "su"],
  mis: ["mis", "tus", "sus", "nuestros", "vuestros", "sus"],
  "mis:f": ["mis", "tus", "sus", "nuestras", "vuestras", "sus"],
};

const ENGLISH_PERSONS = {
  subject: ["I", "you", "she", "we", "you all", "they"],
  object: ["me", "you", "her", "us", "you all", "them"],
  poss: ["my", "your", "her", "our", "your", "their"],
  self: ["myself", "yourself", "herself", "ourselves", "yourselves", "themselves"],
};

// Commands address "you" even when Spanish uses usted/ustedes (third-person forms).
const IMPERATIVE_ENGLISH_PERSON = [null, 1, 1, 3, 4, 4];

// base past participle
const IRREGULAR_ENGLISH = new Map(`
  arise arose arisen, awake awoke awoken, bear bore borne, beat beat beaten, become became become,
  begin began begun, bend bent bent, bet bet bet, bite bit bitten, bleed bled bled, blow blew blown,
  break broke broken, bring brought brought, build built built, buy bought bought, catch caught caught,
  choose chose chosen, come came come, cost cost cost, cut cut cut, deal dealt dealt, dig dug dug,
  do did done, draw drew drawn, drink drank drunk, drive drove driven, eat ate eaten, fall fell fallen,
  feed fed fed, feel felt felt, fight fought fought, find found found, fit fit fit, flee fled fled,
  fly flew flown, forbid forbade forbidden, forget forgot forgotten, forgive forgave forgiven,
  freeze froze frozen, get got gotten, give gave given, go went gone, grow grew grown, hang hung hung,
  have had had, hear heard heard, hide hid hidden, hit hit hit, hold held held, hurt hurt hurt,
  keep kept kept, know knew known, lay laid laid, lead led led, leave left left, lend lent lent,
  let let let, light lit lit, lose lost lost, make made made, mean meant meant, meet met met,
  mislead misled misled, overcome overcame overcome, pay paid paid, put put put, quit quit quit,
  read read read, ride rode ridden, ring rang rung, rise rose risen, run ran run, say said said,
  see saw seen, seek sought sought, sell sold sold, send sent sent, set set set, shake shook shaken,
  shine shone shone, shoot shot shot, show showed shown, shut shut shut, sing sang sung, sink sank sunk,
  sit sat sat, sleep slept slept, slide slid slid, speak spoke spoken, spend spent spent,
  split split split, spread spread spread, stand stood stood, steal stole stolen, stick stuck stuck,
  sting stung stung, strike struck struck, swear swore sworn, sweep swept swept, swim swam swum,
  swing swung swung, take took taken, teach taught taught, tear tore torn, tell told told,
  think thought thought, throw threw thrown, understand understood understood, undo undid undone,
  upset upset upset, wake woke woken, wear wore worn, win won won, wind wound wound,
  withstand withstood withstood, write wrote written
`.trim().split(/\s*,\s*/).map((entry) => {
  const [base, past, participle] = entry.split(/\s+/);
  return [base, { past, participle }];
}));

// Stress falls on the last syllable, so the final consonant doubles: admitted, preferring.
const STRESS_FINAL = new Set([
  "admit", "begin", "commit", "compel", "confer", "control", "deter", "equip", "excel", "expel", "forbid", "forget", "infer",
  "occur", "omit", "patrol", "permit", "prefer", "propel", "rebel", "refer", "regret", "submit",
  "transfer", "upset",
]);

function doublesFinalConsonant(verb) {
  return STRESS_FINAL.has(verb) || /^[^aeiou]*[aeiou][b-df-hj-np-tvz]$/.test(verb);
}

function regularPast(verb) {
  if (verb.endsWith("e")) return `${verb}d`;
  if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ied`;
  if (doublesFinalConsonant(verb)) return `${verb}${verb.at(-1)}ed`;
  return `${verb}ed`;
}

export function englishForms(verb) {
  const irregular = IRREGULAR_ENGLISH.get(verb);
  let third = `${verb}s`;
  if (verb === "be") third = "is";
  else if (verb === "have") third = "has";
  else if (/(s|x|z|ch|sh|o)$/.test(verb)) third = `${verb}es`;
  else if (/[^aeiou]y$/.test(verb)) third = `${verb.slice(0, -1)}ies`;

  let gerund = `${verb}ing`;
  if (verb.endsWith("ie")) gerund = `${verb.slice(0, -2)}ying`;
  else if (/[^eyo]e$/.test(verb) && verb !== "be") gerund = `${verb.slice(0, -1)}ing`;
  else if (doublesFinalConsonant(verb)) gerund = `${verb}${verb.at(-1)}ing`;

  return {
    base: verb,
    third,
    past: verb === "be" ? "was" : irregular?.past ?? regularPast(verb),
    participle: verb === "be" ? "been" : irregular?.participle ?? regularPast(verb),
    gerund,
  };
}

// agreement: "1sg" (I), "3sg" (she, it, a singular noun), or "plural" (you, we, they).
function englishPresent(verb, agreement) {
  if (verb === "be") return { "1sg": "am", "3sg": "is" }[agreement] ?? "are";
  return agreement === "3sg" ? englishForms(verb).third : verb;
}

function englishPast(verb, agreement) {
  if (verb === "be") return agreement === "plural" ? "were" : "was";
  return englishForms(verb).past;
}

function fillPlaceholders(text, spanishIndex, englishIndex) {
  return text
    .replace(/\{(mis?(?::f)?)\}/g, (_, key) => SPANISH_POSSESSIVES[key][spanishIndex])
    .replace("{poss}", ENGLISH_PERSONS.poss[englishIndex])
    .replace("{self}", ENGLISH_PERSONS.self[englishIndex]);
}

function tidy(text) {
  const clean = text.replace(/\s+/g, " ").replace(/\s+([,.!])/g, "$1").trim();
  return clean.replace(/^(¡?)(\p{L})/u, (_, mark, letter) => mark + letter.toLocaleUpperCase("es"));
}

// Who does what: the Spanish subject, clitic, and complement plus the English clause they map to.
function describeClause(entry, personIndex, { imperative = false, nonFinite = false } = {}) {
  const [complement, phrase, options = {}] = entry;
  const index = nonFinite ? 2 : personIndex;
  const [head, ...rest] = phrase.split(" ");
  const clause = {
    es: { subject: SPANISH_SUBJECTS[index], clitic: "", complement },
    en: {
      subject: ENGLISH_PERSONS.subject[index],
      object: ENGLISH_PERSONS.object[index],
      agreement: { 0: "1sg", 2: "3sg" }[index] ?? "plural",
      head,
      rest: rest.join(" "),
      stative: Boolean(options.stative),
      adverb: options.adverb ?? "",
    },
  };

  if (options.third || options.inverse) {
    if (imperative) return null;
    const nouns = options.third || options.inverse;
    const noun = nonFinite ? nouns[0] : nouns[{ 2: 0, 5: 1 }[personIndex]];
    if (!noun) return null;
    const [spanishNoun, englishNoun] = noun;
    const nounAgreement = nouns.indexOf(noun) === 0 ? "3sg" : "plural";

    if (options.third) {
      Object.assign(clause.es, { subject: spanishNoun });
      Object.assign(clause.en, { subject: englishNoun, object: englishNoun, agreement: nounAgreement });
    } else {
      // Me gusta la película: the conjugated form agrees with the thing, while English
      // usually makes the person the subject (I like the movie).
      Object.assign(clause.es, { subject: "", clitic: "me", complement: `${complement} ${spanishNoun}` });
      clause.en.stative = true;
      if (options.enNounSubject) {
        Object.assign(clause.en, { subject: englishNoun, object: englishNoun, agreement: nounAgreement });
      } else {
        const rest = clause.en.rest.includes("{noun}")
          ? clause.en.rest.replace("{noun}", englishNoun)
          : `${clause.en.rest} ${englishNoun}`;
        Object.assign(clause.en, { subject: "I", object: "me", agreement: "1sg", rest });
      }
    }
  }

  const englishIndex = imperative ? IMPERATIVE_ENGLISH_PERSON[personIndex] : index;
  clause.es.complement = fillPlaceholders(clause.es.complement, index, englishIndex);
  clause.en.rest = fillPlaceholders(clause.en.rest, index, englishIndex);
  return clause;
}

const SPANISH_FRAMES = {
  present: "{S} {V} {C}.",
  preterite: "Ayer {S} {V} {C}.",
  imperfect: "Antes {S} {V} {C}.",
  presentPerfect: "Esta semana {S} {V} {C}.",
  future: "Mañana {S} {V} {C}.",
  conditional: "En ese caso, {S} {V} {C}.",
  pluperfect: "Para entonces, {S} ya {V} {C}.",
  futurePerfect: "Para el viernes, {S} {V} {C}.",
  conditionalPerfect: "En otras circunstancias, {S} {V} {C}.",
  presentSubjunctive: "Es importante que {S} {V} {C}.",
  imperfectSubjunctive: "Sería mejor que {S} {V} {C}.",
  presentPerfectSubjunctive: "Ojalá {S} {V} {C}.",
  pluperfectSubjunctive: "Si {S} {V} {C}, todo habría sido distinto.",
  affirmativeImperative: "¡{V} {C}!",
  negativeImperative: "¡{V} {C}!",
};

const ENGLISH_FRAMES = {
  present: (e) => `${e.subject} ${e.adverb} ${englishPresent(e.head, e.agreement)} ${e.rest}.`,
  preterite: (e) => `Yesterday ${e.subject} ${englishPast(e.head, e.agreement)} ${e.rest}.`,
  imperfect: (e) => `${e.subject} used to ${e.head} ${e.rest}.`,
  presentPerfect: (e) => `This week ${e.subject} ${englishPresent("have", e.agreement)} ${e.participle} ${e.rest}.`,
  future: (e) => `Tomorrow ${e.subject} will ${e.head} ${e.rest}.`,
  conditional: (e) => `In that case, ${e.subject} would ${e.head} ${e.rest}.`,
  pluperfect: (e) => `By then, ${e.subject} had already ${e.participle} ${e.rest}.`,
  futurePerfect: (e) => `By Friday, ${e.subject} will have ${e.participle} ${e.rest}.`,
  conditionalPerfect: (e) => `Under other circumstances, ${e.subject} would have ${e.participle} ${e.rest}.`,
  presentSubjunctive: (e) => `It's important for ${e.object} to ${e.head} ${e.rest}.`,
  imperfectSubjunctive: (e) => `It would be better if ${e.subject} ${e.head === "be" ? "were" : englishPast(e.head)} ${e.rest}.`,
  presentPerfectSubjunctive: (e) => `I hope ${e.subject} ${englishPresent("have", e.agreement)} ${e.participle} ${e.rest}.`,
  pluperfectSubjunctive: (e) => `If ${e.subject} had ${e.participle} ${e.rest}, everything would have been different.`,
  affirmativeImperative: (e, personIndex) => `${personIndex === 3 ? "Let's " : ""}${e.head} ${e.rest}!`,
  negativeImperative: (e, personIndex) => `${personIndex === 3 ? "Let's not" : "Don't"} ${e.head} ${e.rest}!`,
};

// Non-finite forms have no person, so each gets its own frame around a third-person subject.
const NON_FINITE_FRAMES = [
  {
    es: "{S} {cl} va a {V} {C}.",
    en: (e) => `${e.subject} ${englishPresent("be", e.agreement)} going to ${e.head} ${e.rest}.`,
  },
  {
    es: "{S} {cl} sigue {V} {C}.",
    en: (e) => {
      if (!e.stative) return `${e.subject} ${englishPresent("be", e.agreement)} still ${e.gerund} ${e.rest}.`;
      if (e.head === "be") return `${e.subject} ${englishPresent("be", e.agreement)} still ${e.rest}.`;
      return `${e.subject} still ${englishPresent(e.head, e.agreement)} ${e.rest}.`;
    },
  },
  {
    es: "{S} {cl} {se} ha {V} {C}.",
    en: (e) => `${e.subject} ${englishPresent("have", e.agreement)} ${e.participle} ${e.rest}.`,
  },
  {
    es: "{S} parece {V} {C}.",
    en: (e) => `${e.subject} ${englishPresent("seem", e.agreement)} to have ${e.participle} ${e.rest}.`,
    personal: true,
  },
  {
    es: "{V} {C}, {S} siguió adelante.",
    en: (e) => `Having ${e.participle} ${e.rest}, ${e.subject} moved on.`,
    personal: true,
    needsPerson: true,
  },
];

function fillSpanish(template, parts) {
  return tidy(template
    .replace("{S}", parts.subject)
    .replace("{cl}", parts.clitic)
    .replace("{se}", parts.se ?? "")
    .replace("{V}", parts.verb)
    .replace("{C}", parts.complement));
}

/**
 * Builds a Spanish sentence that uses `form` (the conjugated form shown for this tense and
 * person) and its English translation. Returns null when the verb has no sentence data or the
 * form has no natural everyday use, such as "yo gusto" or an imperative of "saber".
 */
export function contextSentence(verb, tenseId, personIndex, form) {
  const entry = CONTEXTS[verb.infinitive];
  if (!entry) return null;
  const options = entry[2] ?? {};
  if (options.tenses && !options.tenses.includes(tenseId)) return null;
  if (options.skip?.includes(tenseId) || options.skip?.includes(`${tenseId}:${personIndex}`)) return null;

  const imperative = tenseId === "affirmativeImperative" || tenseId === "negativeImperative";
  if (imperative && options.noImperative) return null;
  const nonFinite = tenseId === "nonFinite";
  const clause = describeClause(entry, personIndex, { imperative, nonFinite });
  if (!clause) return null;

  const english = { ...clause.en, ...englishForms(clause.en.head) };
  english.head = english.base;
  let spanishTemplate = SPANISH_FRAMES[tenseId];
  let englishFrame = ENGLISH_FRAMES[tenseId];
  // "Suelo caminar" is "I usually walk", but "solía caminar" is just "I used to walk".
  if (tenseId !== "present") english.adverb = "";

  if (nonFinite) {
    const frame = NON_FINITE_FRAMES[personIndex];
    if (frame.personal && clause.es.clitic) return null;
    if (frame.needsPerson && options.third) return null;
    spanishTemplate = frame.es;
    englishFrame = frame.en;
  }

  const spanish = fillSpanish(spanishTemplate, {
    subject: clause.es.subject,
    clitic: clause.es.clitic,
    se: nonFinite && verb.reflexiveOf ? "se" : "",
    verb: clause.es.clitic && !nonFinite ? `${clause.es.clitic} ${form}` : form,
    complement: clause.es.complement,
  });
  return [spanish, tidy(englishFrame(english, personIndex))];
}
