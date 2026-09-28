import { VERB_INDEX } from "./data/verbs.js";

export const PERSONS = Object.freeze([
  { subject: "yo", english: "I" },
  { subject: "tú", english: "you (informal)" },
  { subject: "él / ella / usted", english: "he / she / you" },
  { subject: "nosotros/as", english: "we" },
  { subject: "vosotros/as", english: "you all (Spain)" },
  { subject: "ellos / ellas / ustedes", english: "they / you all" },
]);

export const MOODS = Object.freeze([
  { id: "indicative", label: "Indicativo", englishLabel: "Indicative" },
  { id: "subjunctive", label: "Subjuntivo", englishLabel: "Subjunctive" },
  { id: "imperative", label: "Imperativo", englishLabel: "Imperative" },
  { id: "nonfinite", label: "Formas no personales", englishLabel: "Non-finite" },
]);

const haber = {
  presentPerfect: ["he", "has", "ha", "hemos", "habéis", "han"],
  pluperfect: ["había", "habías", "había", "habíamos", "habíais", "habían"],
  futurePerfect: ["habré", "habrás", "habrá", "habremos", "habréis", "habrán"],
  conditionalPerfect: ["habría", "habrías", "habría", "habríamos", "habríais", "habrían"],
  presentPerfectSubjunctive: ["haya", "hayas", "haya", "hayamos", "hayáis", "hayan"],
  pluperfectSubjunctive: ["hubiera", "hubieras", "hubiera", "hubiéramos", "hubierais", "hubieran"],
};

export const TENSES = Object.freeze([
  { id: "present", mood: "indicative", label: "Presente", fullLabel: "Presente de indicativo", englishLabel: "Present indicative", level: "A1", description: "Used for routines, facts, and current states." },
  { id: "preterite", mood: "indicative", label: "Pretérito", fullLabel: "Pretérito perfecto simple", englishLabel: "Preterite", level: "A2", description: "Used for completed actions at a defined point in the past." },
  { id: "imperfect", mood: "indicative", label: "Imperfecto", fullLabel: "Pretérito imperfecto", englishLabel: "Imperfect", level: "A2", description: "Used for habitual, ongoing, or descriptive past situations." },
  { id: "presentPerfect", mood: "indicative", label: "Pretérito perfecto", fullLabel: "Pretérito perfecto compuesto", englishLabel: "Present perfect", level: "A2", description: "Connects a completed past action with the present." },
  { id: "future", mood: "indicative", label: "Futuro", fullLabel: "Futuro simple", englishLabel: "Simple future", level: "B1", description: "Expresses what will happen or a guess about the present." },
  { id: "conditional", mood: "indicative", label: "Condicional", fullLabel: "Condicional simple", englishLabel: "Simple conditional", level: "B1", description: "Expresses what would happen, polite requests, or conjecture." },
  { id: "pluperfect", mood: "indicative", label: "Pluscuamperfecto", fullLabel: "Pretérito pluscuamperfecto", englishLabel: "Pluperfect", level: "B1", description: "Expresses what had already happened before another past event." },
  { id: "futurePerfect", mood: "indicative", label: "Futuro compuesto", fullLabel: "Futuro compuesto", englishLabel: "Future perfect", level: "B2", description: "Expresses what will have happened by a future point." },
  { id: "conditionalPerfect", mood: "indicative", label: "Condicional compuesto", fullLabel: "Condicional compuesto", englishLabel: "Conditional perfect", level: "B2", description: "Expresses what would have happened under different conditions." },
  { id: "presentSubjunctive", mood: "subjunctive", label: "Presente", fullLabel: "Presente de subjuntivo", englishLabel: "Present subjunctive", level: "B1", description: "Used after expressions of desire, doubt, emotion, and influence." },
  { id: "imperfectSubjunctive", mood: "subjunctive", label: "Imperfecto", fullLabel: "Pretérito imperfecto de subjuntivo", englishLabel: "Imperfect subjunctive (-ra)", level: "B2", description: "Used for hypothetical or past-dependent subjunctive situations." },
  { id: "presentPerfectSubjunctive", mood: "subjunctive", label: "Pretérito perfecto", fullLabel: "Pretérito perfecto de subjuntivo", englishLabel: "Present perfect subjunctive", level: "B2", description: "Expresses a completed action viewed through doubt, emotion, or influence." },
  { id: "pluperfectSubjunctive", mood: "subjunctive", label: "Pluscuamperfecto", fullLabel: "Pretérito pluscuamperfecto de subjuntivo", englishLabel: "Pluperfect subjunctive", level: "B2", description: "Used for unreal past conditions and past counterfactuals." },
  { id: "affirmativeImperative", mood: "imperative", label: "Afirmativo", fullLabel: "Imperativo afirmativo", englishLabel: "Affirmative imperative", level: "A2", description: "Used to tell someone what to do." },
  { id: "negativeImperative", mood: "imperative", label: "Negativo", fullLabel: "Imperativo negativo", englishLabel: "Negative imperative", level: "B1", description: "Used to tell someone what not to do." },
  { id: "nonFinite", mood: "nonfinite", label: "Formas básicas", fullLabel: "Formas no personales", englishLabel: "Non-finite forms", level: "A1–B2", description: "Forms that do not change for grammatical person." },
]);

export const TENSE_INDEX = new Map(TENSES.map((tense) => [tense.id, tense]));

const regularEndings = {
  present: {
    ar: ["o", "as", "a", "amos", "áis", "an"],
    er: ["o", "es", "e", "emos", "éis", "en"],
    ir: ["o", "es", "e", "imos", "ís", "en"],
  },
  preterite: {
    ar: ["é", "aste", "ó", "amos", "asteis", "aron"],
    er: ["í", "iste", "ió", "imos", "isteis", "ieron"],
    ir: ["í", "iste", "ió", "imos", "isteis", "ieron"],
  },
  imperfect: {
    ar: ["aba", "abas", "aba", "ábamos", "abais", "aban"],
    er: ["ía", "ías", "ía", "íamos", "íais", "ían"],
    ir: ["ía", "ías", "ía", "íamos", "íais", "ían"],
  },
  future: ["é", "ás", "á", "emos", "éis", "án"],
  conditional: ["ía", "ías", "ía", "íamos", "íais", "ían"],
  irregularPreterite: ["e", "iste", "o", "imos", "isteis", "ieron"],
};

const reflexivePronouns = ["me", "te", "se", "nos", "os", "se"];

export function normalizeInfinitive(value) {
  return value.normalize("NFC").toLocaleLowerCase("es").trim();
}

function baseInfinitive(record) {
  return record.reflexiveOf || record.infinitive.replace(/se$/, "");
}

export function getVerbClass(record) {
  const infinitive = baseInfinitive(record);
  if (infinitive.endsWith("ír")) return "ir";
  return infinitive.slice(-2);
}

export function getStem(record) {
  return baseInfinitive(record).slice(0, -2);
}

// construir → construyo: -uir verbs (but not -guir/-quir) insert y before a stressed ending.
function isUirVerb(record) {
  return /[^gq]uir$/.test(baseInfinitive(record));
}

// creer, leer, caer: -er/-ir stems ending in a strong vowel take y and written accents in the preterite.
function hasVowelStem(record) {
  return getVerbClass(record) !== "ar" && /[aeo]$/.test(getStem(record));
}

// Keeps the consonant sound before -o/-a endings: coger → cojo, seguir → sigo, vencer → venzo.
function softenBeforeBackVowel(record, stem) {
  const infinitive = baseInfinitive(record);
  if (/g(er|ir)$/.test(infinitive) && stem.endsWith("g")) return stem.slice(0, -1) + "j";
  if (infinitive.endsWith("guir") && stem.endsWith("gu")) return stem.slice(0, -1);
  if (/[^aeiou]c(er|ir)$/.test(infinitive) && stem.endsWith("c")) return stem.slice(0, -1) + "z";
  return stem;
}

export function createRegularVerb(infinitive, translation = "translation unavailable") {
  const normalized = normalizeInfinitive(infinitive);
  const base = normalized.endsWith("se") ? normalized.slice(0, -2) : normalized;
  if (!/(ar|er|ir)$/.test(base)) {
    throw new Error("Enter a Spanish infinitive ending in -ar, -er, -ir, or -se.");
  }
  return {
    infinitive: normalized,
    translation,
    level: "Unlisted",
    ...(normalized.endsWith("se") ? { reflexiveOf: base } : {}),
    generated: true,
  };
}

function resolveBaseRecord(record) {
  if (!record.reflexiveOf) return record;
  const listed = VERB_INDEX.get(record.reflexiveOf);
  if (listed) return listed;
  if (record.generated) return createRegularVerb(record.reflexiveOf);
  // A catalog reflexive without a listed base carries the base's irregularities itself.
  const { reflexiveOf, nonFinite, example, forms, ...irregularities } = record;
  const { affirmativeImperative, ...baseForms } = forms || {};
  return {
    ...irregularities,
    infinitive: reflexiveOf,
    ...(Object.keys(baseForms).length ? { forms: baseForms } : {}),
  };
}

function replaceLast(source, needle, replacement) {
  const index = source.lastIndexOf(needle);
  if (index < 0) return source;
  return source.slice(0, index) + replacement + source.slice(index + needle.length);
}

function changedStem(record, personIndex, context = "present") {
  const stem = getStem(record);
  const pattern = record.patterns?.[0];
  const verbClass = getVerbClass(record);
  const isNosotrosOrVosotros = personIndex === 3 || personIndex === 4;

  if (!pattern) return stem;
  if (isNosotrosOrVosotros) {
    if (context === "subjunctive" && verbClass === "ir") {
      if (pattern === "e→ie" || pattern === "e→i") return replaceLast(stem, "e", "i");
      if (pattern === "o→ue") return replaceLast(stem, "o", "u");
    }
    return stem;
  }

  if (pattern === "e→ie") return replaceLast(stem, "e", "ie");
  if (pattern === "e→i") return replaceLast(stem, "e", "i");
  if (pattern === "o→ue") return replaceLast(stem, "o", "ue");
  if (pattern === "u→ue") return replaceLast(stem, "u", "ue");
  if (pattern === "i→í") return replaceLast(stem, "i", "í");
  if (pattern === "u→ú") return replaceLast(stem, "u", "ú");
  return stem;
}

function presentForms(record) {
  if (record.forms?.present) return [...record.forms.present];
  const verbClass = getVerbClass(record);
  const forms = regularEndings.present[verbClass].map((ending, index) => {
    const stem = changedStem(record, index);
    if (isUirVerb(record) && index !== 3 && index !== 4) return `${stem}y${ending}`;
    return (ending === "o" ? softenBeforeBackVowel(record, stem) : stem) + ending;
  });
  if (record.presentYo) forms[0] = record.presentYo;
  return forms;
}

function regularPreteriteStem(record, personIndex) {
  let stem = getStem(record);
  const infinitive = record.infinitive;

  if (personIndex === 0) {
    if (infinitive.endsWith("car")) stem = stem.slice(0, -1) + "qu";
    if (infinitive.endsWith("gar")) stem += "u";
    if (infinitive.endsWith("zar")) stem = stem.slice(0, -1) + "c";
  }

  if (getVerbClass(record) === "ir" && (personIndex === 2 || personIndex === 5)) {
    const pattern = record.patterns?.[0];
    if (pattern === "e→ie" || pattern === "e→i") stem = replaceLast(stem, "e", "i");
    if (pattern === "o→ue") stem = replaceLast(stem, "o", "u");
  }
  return stem;
}

function preteriteForms(record) {
  if (record.forms?.preterite) return [...record.forms.preterite];
  if (record.preteriteStem) {
    const forms = regularEndings.irregularPreterite.map((ending) => record.preteriteStem + ending);
    // conduj- + -eron, not -ieron: condujeron, dijeron, trajeron.
    if (record.preteriteStem.endsWith("j")) forms[5] = `${record.preteriteStem}eron`;
    return forms;
  }
  const stem = getStem(record);
  if (isUirVerb(record)) {
    return ["í", "iste", "yó", "imos", "isteis", "yeron"].map((ending) => stem + ending);
  }
  if (hasVowelStem(record)) {
    return ["í", "íste", "yó", "ímos", "ísteis", "yeron"].map((ending) => stem + ending);
  }
  const verbClass = getVerbClass(record);
  return regularEndings.preterite[verbClass].map((ending, index) => regularPreteriteStem(record, index) + ending);
}

function imperfectForms(record) {
  if (record.forms?.imperfect) return [...record.forms.imperfect];
  const verbClass = getVerbClass(record);
  const stem = getStem(record);
  return regularEndings.imperfect[verbClass].map((ending) => stem + ending);
}

// oír → oiré: the infinitive's written accent disappears once an ending takes the stress.
function futureStem(record) {
  return record.futureStem || record.infinitive.replace(/ír$/, "ir");
}

function futureForms(record) {
  const stem = futureStem(record);
  return regularEndings.future.map((ending) => stem + ending);
}

function conditionalForms(record) {
  const stem = futureStem(record);
  return regularEndings.conditional.map((ending) => stem + ending);
}

function spellingAdjustedStem(record, stem) {
  const infinitive = record.infinitive;
  if (infinitive.endsWith("car")) return stem.slice(0, -1) + "qu";
  if (infinitive.endsWith("gar")) return stem + "u";
  if (infinitive.endsWith("zar")) return stem.slice(0, -1) + "c";
  return softenBeforeBackVowel(record, stem);
}

function presentSubjunctiveForms(record) {
  if (record.forms?.presentSubjunctive) return [...record.forms.presentSubjunctive];
  const verbClass = getVerbClass(record);
  const endings = verbClass === "ar"
    ? ["e", "es", "e", "emos", "éis", "en"]
    : ["a", "as", "a", "amos", "áis", "an"];
  const yo = presentForms(record)[0];
  const derivedYoStem = yo.endsWith("o") ? yo.slice(0, -1) : getStem(record);

  return endings.map((ending, index) => {
    const isNosotrosOrVosotros = index === 3 || index === 4;
    let stem = record.patterns?.length
      ? changedStem(record, index, "subjunctive")
      : derivedYoStem;

    if (record.patterns?.length && !isNosotrosOrVosotros) {
      stem = changedStem(record, index, "present");
    }
    stem = spellingAdjustedStem(record, stem);
    return stem + ending;
  });
}

function accentLastVowel(value) {
  const replacements = { a: "á", e: "é", i: "í", o: "ó", u: "ú" };
  for (let index = value.length - 1; index >= 0; index -= 1) {
    const character = value[index];
    if (/[áéíóú]/.test(character)) return value;
    if (replacements[character]) {
      return value.slice(0, index) + replacements[character] + value.slice(index + 1);
    }
  }
  return value;
}

function accentPenultimateNucleus(value) {
  if (/[áéíóú]/.test(value)) return value;
  // Adjacent strong vowels are separate syllables (ca-e), so each nucleus holds at most one.
  const matches = [...value.matchAll(/[iuü]*[aeo][iuü]*|[iuü]+/g)];
  if (matches.length < 2) return value;
  const nucleus = matches[matches.length - 2];
  const preferredOffset = [...nucleus[0]].findIndex((letter) => /[aeo]/.test(letter));
  const offset = preferredOffset >= 0 ? preferredOffset : nucleus[0].length - 1;
  const index = nucleus.index + offset;
  const accented = { a: "á", e: "é", i: "í", o: "ó", u: "ú", ü: "ǘ" }[value[index]];
  return value.slice(0, index) + accented + value.slice(index + 1);
}

function imperfectSubjunctiveForms(record) {
  const ellosPreterite = preteriteForms(record)[5];
  const base = ellosPreterite.replace(/ron$/, "");
  return [
    `${base}ra`,
    `${base}ras`,
    `${base}ra`,
    `${accentLastVowel(base)}ramos`,
    `${base}rais`,
    `${base}ran`,
  ];
}

export function getParticiple(record) {
  if (record.participle) return record.participle;
  const verbClass = getVerbClass(record);
  if (verbClass === "ar") return `${getStem(record)}ado`;
  return getStem(record) + (hasVowelStem(record) ? "ído" : "ido");
}

export function getGerund(record) {
  if (record.gerund) return record.gerund;
  const verbClass = getVerbClass(record);
  if (verbClass === "ar") return `${getStem(record)}ando`;
  if (isUirVerb(record) || hasVowelStem(record)) return `${getStem(record)}yendo`;
  // Stem-changing -ir verbs raise the vowel: pedir → pidiendo, dormir → durmiendo.
  return regularPreteriteStem(record, 2) + "iendo";
}

function affirmativeImperativeForms(record) {
  if (record.forms?.affirmativeImperative) return [...record.forms.affirmativeImperative];
  const present = presentForms(record);
  const subjunctive = presentSubjunctiveForms(record);
  const vosotros = record.infinitive.slice(0, -1) + "d";
  return [null, present[2], subjunctive[2], subjunctive[3], vosotros, subjunctive[5]];
}

function negativeImperativeForms(record) {
  const subjunctive = presentSubjunctiveForms(record);
  return [null, ...subjunctive.slice(1).map((form) => `no ${form}`)];
}

function compoundForms(record, tenseId) {
  const participle = getParticiple(record);
  return haber[tenseId].map((auxiliary) => `${auxiliary} ${participle}`);
}

function nonFiniteForms(record) {
  if (record.nonFinite) return [...record.nonFinite];
  const source = resolveBaseRecord(record);
  const participle = getParticiple(source);
  if (record.reflexiveOf) {
    return [
      record.infinitive,
      `${accentPenultimateNucleus(getGerund(source))}se`,
      participle,
      `haberse ${participle}`,
      `habiéndose ${participle}`,
    ];
  }
  return [
    record.infinitive,
    getGerund(source),
    participle,
    `haber ${participle}`,
    `habiendo ${participle}`,
  ];
}

function baseForms(record, tenseId) {
  if (record.forms?.[tenseId]) return [...record.forms[tenseId]];
  if (haber[tenseId]) return compoundForms(record, tenseId);
  if (tenseId === "present") return presentForms(record);
  if (tenseId === "preterite") return preteriteForms(record);
  if (tenseId === "imperfect") return imperfectForms(record);
  if (tenseId === "future") return futureForms(record);
  if (tenseId === "conditional") return conditionalForms(record);
  if (tenseId === "presentSubjunctive") return presentSubjunctiveForms(record);
  if (tenseId === "imperfectSubjunctive") return imperfectSubjunctiveForms(record);
  if (tenseId === "affirmativeImperative") return affirmativeImperativeForms(record);
  if (tenseId === "negativeImperative") return negativeImperativeForms(record);
  if (tenseId === "nonFinite") return nonFiniteForms(record);
  throw new Error(`Unsupported tense: ${tenseId}`);
}

function applyReflexive(record, tenseId, forms) {
  if (!record.reflexiveOf || tenseId === "nonFinite") return forms;
  if (tenseId === "affirmativeImperative") {
    if (record.forms?.affirmativeImperative) return forms;
    const verbClass = getVerbClass(resolveBaseRecord(record));
    return forms.map((form, index) => {
      if (!form) return null;
      if (index === 4) {
        const withoutD = form.replace(/d$/, "");
        return `${verbClass === "ir" ? accentLastVowel(withoutD) : withoutD}os`;
      }
      if (index === 3) return `${accentPenultimateNucleus(form).replace(/s$/, "")}nos`;
      return `${accentPenultimateNucleus(form)}${reflexivePronouns[index]}`;
    });
  }
  if (tenseId === "negativeImperative") {
    return forms.map((form, index) => {
      if (!form) return null;
      return form.replace(/^no /, `no ${reflexivePronouns[index]} `);
    });
  }
  return forms.map((form, index) => `${reflexivePronouns[index]} ${form}`);
}

function recordsForForms(record, tenseId) {
  if (tenseId === "nonFinite") {
    const labels = ["infinitivo", "gerundio", "participio", "infinitivo compuesto", "gerundio compuesto"];
    const english = ["infinitive: to…", "gerund: -ing form", "past participle", "perfect infinitive: to have…", "perfect gerund: having…"];
    return baseForms(record, tenseId).map((form, index) => ({
      personIndex: index,
      subject: labels[index],
      english: english[index],
      form,
    }));
  }

  const source = record.reflexiveOf ? resolveBaseRecord(record) : record;
  let forms = record.forms?.[tenseId]
    ? [...record.forms[tenseId]]
    : baseForms(source, tenseId);
  forms = applyReflexive(record, tenseId, forms);

  return forms
    .map((form, index) => ({ personIndex: index, ...PERSONS[index], form }))
    .filter((item) => item.form);
}

export function conjugate(record, tenseId) {
  if (!TENSE_INDEX.has(tenseId)) throw new Error(`Unknown tense: ${tenseId}`);
  return recordsForForms(record, tenseId);
}

export function describeVerb(record) {
  const source = resolveBaseRecord(record);
  const verbClass = getVerbClass(source).toUpperCase();
  const isIrregular = Boolean(
    source.patterns?.length || source.forms || source.presentYo || source.preteriteStem
      || source.futureStem || source.participle || source.gerund,
  );
  const tags = [`-${verbClass} verb`];
  if (record.reflexiveOf) tags.push("reflexive");
  source.patterns?.forEach((pattern) => {
    tags.push(/[íú]$/.test(pattern) ? `${pattern} accent` : `${pattern} stem change`);
  });
  if (source.presentYo) tags.push(`irregular yo: ${source.presentYo}`);
  if (isUirVerb(source)) tags.push("y insertion");
  tags.push(isIrregular ? "irregular pattern" : "regular pattern");
  if (record.generated) tags.push("generated by rule");
  return tags;
}

function endingFor(record, tenseId, personIndex) {
  const verbClass = getVerbClass(record);
  if (tenseId === "present") return regularEndings.present[verbClass][personIndex];
  if (tenseId === "preterite") {
    return (record.preteriteStem ? regularEndings.irregularPreterite : regularEndings.preterite[verbClass])[personIndex];
  }
  if (tenseId === "imperfect") return regularEndings.imperfect[verbClass][personIndex];
  if (tenseId === "future") return regularEndings.future[personIndex];
  if (tenseId === "conditional") return regularEndings.conditional[personIndex];
  if (tenseId === "presentSubjunctive") {
    return (verbClass === "ar"
      ? ["e", "es", "e", "emos", "éis", "en"]
      : ["a", "as", "a", "amos", "áis", "an"])[personIndex];
  }
  if (tenseId === "imperfectSubjunctive") return ["ra", "ras", "ra", "ramos", "rais", "ran"][personIndex];
  return null;
}

function splitParticiple(record, participle) {
  const source = resolveBaseRecord(record);
  if (source.participle) return [{ text: participle, role: "stem" }];
  const ending = getVerbClass(source) === "ar" ? "ado" : "ido";
  return [
    { text: participle.slice(0, -ending.length), role: "stem" },
    { text: ending, role: "ending" },
  ];
}

export function explainForm(record, tenseId, personIndex, renderedForm) {
  const tense = TENSE_INDEX.get(tenseId);
  const source = resolveBaseRecord(record);
  const pieces = [];
  let form = renderedForm;

  if (record.reflexiveOf && tenseId !== "affirmativeImperative" && tenseId !== "nonFinite") {
    if (tenseId === "negativeImperative") {
      pieces.push({ text: `no ${reflexivePronouns[personIndex]}`, role: "pronoun" });
      form = form.replace(`no ${reflexivePronouns[personIndex]} `, "");
    } else {
      pieces.push({ text: reflexivePronouns[personIndex], role: "pronoun" });
      form = form.replace(`${reflexivePronouns[personIndex]} `, "");
    }
  }

  if (haber[tenseId]) {
    const auxiliary = haber[tenseId][personIndex];
    const participle = getParticiple(source);
    pieces.push({ text: auxiliary, role: "auxiliary" }, ...splitParticiple(source, participle));
    return {
      pieces,
      result: renderedForm,
      note: `The ${tense.englishLabel.toLocaleLowerCase("en")} uses the matching form of haber first, followed by an unchanged past participle.`,
    };
  }

  if (tenseId === "nonFinite") {
    return {
      pieces: [{ text: renderedForm, role: "stem" }],
      result: renderedForm,
      note: "Non-finite forms do not change for grammatical person.",
    };
  }

  if (tenseId === "affirmativeImperative" && record.reflexiveOf) {
    return {
      pieces: [{ text: renderedForm, role: "stem" }],
      result: renderedForm,
      note: "Affirmative reflexive commands attach the pronoun to the end; a written accent preserves the original stress when needed.",
    };
  }

  const ending = endingFor(source, tenseId, personIndex);
  if (ending && form.endsWith(ending) && form.length > ending.length) {
    pieces.push(
      { text: form.slice(0, -ending.length), role: "stem" },
      { text: ending, role: "ending" },
    );
  } else {
    pieces.push({ text: form, role: "stem" });
  }

  return {
    pieces,
    result: renderedForm,
    note: source.forms?.[tenseId] || record.forms?.[tenseId]
      ? "This form follows an irregular pattern worth learning as a complete form."
      : `The highlighted ending marks the ${tense.englishLabel.toLocaleLowerCase("en")} form.`,
  };
}
