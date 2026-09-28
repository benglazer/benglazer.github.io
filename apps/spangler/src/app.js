import { VERBS, findVerb } from "./data/verbs.js";
import {
  MOODS,
  TENSES,
  TENSE_INDEX,
  conjugate,
  createRegularVerb,
  describeVerb,
  explainForm,
  normalizeInfinitive,
} from "./conjugator.js";
import { contextSentence } from "./sentences.js";

const elements = {
  form: document.querySelector("#verb-form"),
  input: document.querySelector("#verb-input"),
  suggestions: document.querySelector("#verb-suggestions"),
  error: document.querySelector("#search-error"),
  verbName: document.querySelector("#verb-name"),
  translation: document.querySelector("#verb-translation"),
  tags: document.querySelector("#verb-tags"),
  moodTabs: document.querySelector("#mood-tabs"),
  tenseTabs: document.querySelector("#tense-tabs"),
  tenseTitle: document.querySelector("#tense-title"),
  tenseDescription: document.querySelector("#tense-description"),
  tenseLevel: document.querySelector("#tense-level"),
  list: document.querySelector("#conjugation-list"),
  selectedPerson: document.querySelector("#selected-person"),
  equation: document.querySelector("#pattern-equation"),
  patternNote: document.querySelector("#pattern-note"),
  exampleSpanish: document.querySelector("#example-spanish"),
  exampleEnglish: document.querySelector("#example-english"),
  regionControl: document.querySelector("#region-control"),
  surprise: document.querySelector("#surprise-button"),
  pronounce: document.querySelector("#pronounce-button"),
  verbCount: document.querySelector("#verb-count"),
  toast: document.querySelector("#toast"),
};

const storedRegion = localStorage.getItem("spangler-region");
// ?verb=tener picks the starting verb; older #tener links still work.
let requestedVerb = new URLSearchParams(location.search).get("verb") || "";
if (!requestedVerb) {
  try {
    requestedVerb = decodeURIComponent(location.hash.replace(/^#/, ""));
  } catch {
    requestedVerb = "";
  }
}

requestedVerb = normalizeInfinitive(requestedVerb);

let initialVerb = findVerb("hablar");
if (requestedVerb) {
  try {
    initialVerb = findVerb(requestedVerb) || createRegularVerb(requestedVerb);
  } catch {
    initialVerb = findVerb("hablar");
  }
}

const state = {
  verb: initialVerb,
  mood: "indicative",
  tense: "present",
  selectedPersonIndex: 0,
  // Anything else, including the retired "all" setting, falls back to Latin America.
  region: storedRegion === "spain" ? "spain" : "latin-america",
};

function clear(element) {
  element.replaceChildren();
}

function make(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function tensesForMood(mood) {
  return TENSES.filter((tense) => tense.mood === mood);
}

function currentForms() {
  const forms = conjugate(state.verb, state.tense);
  if (state.region === "latin-america" && state.mood !== "nonfinite") {
    return forms.filter((form) => form.personIndex !== 4);
  }
  return forms;
}

function ensureSelectedPerson(forms) {
  if (!forms.some((form) => form.personIndex === state.selectedPersonIndex)) {
    state.selectedPersonIndex = forms[0]?.personIndex ?? 0;
  }
}

function renderSuggestions() {
  const fragment = document.createDocumentFragment();
  const alphabetical = [...VERBS].sort((a, b) => a.infinitive.localeCompare(b.infinitive, "es"));
  alphabetical.forEach((verb) => {
    const option = document.createElement("option");
    option.value = verb.infinitive;
    option.label = verb.translation;
    fragment.append(option);
  });
  elements.suggestions.replaceChildren(fragment);
  elements.verbCount.textContent = VERBS.length.toLocaleString("en");
}

function renderVerbHeading() {
  elements.verbName.textContent = state.verb.infinitive;
  elements.translation.textContent = state.verb.translation;
  clear(elements.tags);
  const descriptions = describeVerb(state.verb);
  descriptions.forEach((label, index) => {
    elements.tags.append(make("span", `tag${index === descriptions.length - 1 ? " tag-neutral" : ""}`, label));
  });
}

function renderMoodTabs() {
  clear(elements.moodTabs);
  MOODS.forEach((mood) => {
    const button = make("button", "mood-tab", mood.label);
    button.type = "button";
    button.lang = "es";
    button.title = mood.englishLabel;
    button.role = "tab";
    button.setAttribute("aria-selected", String(state.mood === mood.id));
    button.addEventListener("click", () => {
      state.mood = mood.id;
      state.tense = tensesForMood(mood.id)[0].id;
      state.selectedPersonIndex = mood.id === "imperative" ? 1 : 0;
      render();
    });
    elements.moodTabs.append(button);
  });
}

function renderTenseTabs() {
  clear(elements.tenseTabs);
  tensesForMood(state.mood).forEach((tense) => {
    const button = make("button", "tense-tab");
    const label = make("span", "", tense.label);
    const level = make("small", "", tense.level);
    button.type = "button";
    button.role = "tab";
    button.lang = "es";
    button.title = tense.englishLabel;
    button.setAttribute("aria-selected", String(state.tense === tense.id));
    button.append(label, level);
    button.addEventListener("click", () => {
      state.tense = tense.id;
      const forms = currentForms();
      state.selectedPersonIndex = forms[0]?.personIndex ?? 0;
      renderTenseTabs();
      renderResults();
    });
    elements.tenseTabs.append(button);
  });
  // Spanish tense names are long, so keep the active tab visible in the scrolling strip.
  const tab = elements.tenseTabs.querySelector('[aria-selected="true"]').getBoundingClientRect();
  const strip = elements.tenseTabs.getBoundingClientRect();
  if (tab.left < strip.left || tab.right > strip.right) {
    elements.tenseTabs.scrollLeft += tab.left - strip.left - (strip.width - tab.width) / 2;
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 1600);
}

const speechSupported = "speechSynthesis" in window;

function speak(text) {
  const lang = state.region === "latin-america" ? "es-MX" : "es-ES";
  const voices = speechSynthesis.getVoices();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.voice = voices.find((voice) => voice.lang.replace("_", "-") === lang)
    || voices.find((voice) => voice.lang.startsWith("es"))
    || null;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function iconButton(className, label, icon) {
  const button = make("button", `icon-button ${className}`);
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.title = label;
  button.innerHTML = icon;
  return button;
}

const speakerIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

async function copyForm(form) {
  try {
    await navigator.clipboard.writeText(form);
    showToast(`Copied “${form}”`);
  } catch {
    showToast(`Selected form: ${form}`);
  }
}

function renderConjugationRows(forms) {
  clear(elements.list);
  const fragment = document.createDocumentFragment();

  forms.forEach((item) => {
    const row = make("div", "conjugation-row");
    row.setAttribute("aria-current", String(item.personIndex === state.selectedPersonIndex));

    const select = make("button", "row-select");
    select.type = "button";
    select.setAttribute("aria-label", `Explain ${item.subject}: ${item.form}`);
    const subject = make("span", "subject", item.subject);
    const formWrap = make("span", "form-wrap");
    const conjugated = make("span", "conjugated-form", item.form);
    conjugated.lang = "es";
    const meaning = make("span", "form-meaning", `${item.english} · ${state.verb.translation}`);
    formWrap.append(conjugated, meaning);
    select.append(subject, formWrap);
    select.addEventListener("click", () => {
      state.selectedPersonIndex = item.personIndex;
      renderResults();
    });

    row.append(select);

    if (speechSupported) {
      const listen = iconButton("listen-button", `Hear ${item.form}`, speakerIcon);
      listen.addEventListener("click", () => speak(item.form));
      row.append(listen);
    }

    const copy = iconButton("copy-button", `Copy ${item.form}`, "⧉");
    copy.addEventListener("click", () => copyForm(item.form));
    row.append(copy);
    fragment.append(row);
  });

  elements.list.append(fragment);
}

function renderEquation(explanation) {
  clear(elements.equation);
  // An ending fuses onto the piece before it, so group pieces into the words they spell:
  // a wide "+" separates words, and a tight joiner links the parts of one word.
  let word;
  explanation.pieces.forEach((piece, index) => {
    if (piece.role === "ending" && word) {
      word.append(make("span", "equation-join", "+"));
    } else {
      if (index > 0) elements.equation.append(make("span", "equation-plus", "+"));
      word = make("span", "equation-word");
      elements.equation.append(word);
    }
    word.append(make("span", `equation-token ${piece.role}`, piece.text));
  });
  const isAlreadyComplete = explanation.pieces.length === 1
    && explanation.pieces[0].text === explanation.result;
  if (!isAlreadyComplete) {
    // Keep "=" with the result so a wrapped equation never ends on a dangling "=".
    const total = make("span", "equation-total");
    total.append(
      make("span", "equation-equals", "="),
      make("span", "equation-result", explanation.result),
    );
    elements.equation.append(total);
  }
}

function renderLearningPanel(forms) {
  const selected = forms.find((item) => item.personIndex === state.selectedPersonIndex) || forms[0];
  if (!selected) return;
  const explanation = explainForm(state.verb, state.tense, selected.personIndex, selected.form);
  elements.selectedPerson.textContent = selected.subject;
  renderEquation(explanation);
  elements.patternNote.textContent = state.verb.generated
    ? `${explanation.note} This verb is not yet in the curated catalog, so its forms assume a regular pattern.`
    : explanation.note;

  // Prefer the hand-written example when it actually uses this form (some use another person).
  const curated = state.tense === "present" && selected.personIndex === 0 && state.verb.example;
  const example = curated && state.verb.example[0].toLocaleLowerCase("es").includes(selected.form)
    ? state.verb.example
    : contextSentence(state.verb, state.tense, selected.personIndex, selected.form);
  if (example) {
    [elements.exampleSpanish.textContent, elements.exampleEnglish.textContent] = example;
  } else {
    const capitalized = selected.form.charAt(0).toLocaleUpperCase("es") + selected.form.slice(1);
    elements.exampleSpanish.textContent = state.mood === "imperative" ? `¡${capitalized}!` : `${capitalized}.`;
    elements.exampleEnglish.textContent = `${TENSE_INDEX.get(state.tense).englishLabel} of “${state.verb.translation}”.`;
  }
}

function renderResults() {
  const tense = TENSE_INDEX.get(state.tense);
  const forms = currentForms();
  ensureSelectedPerson(forms);
  elements.tenseTitle.textContent = tense.fullLabel;
  elements.tenseDescription.textContent = `${tense.englishLabel} · ${tense.description}`;
  elements.tenseLevel.textContent = tense.level;
  renderConjugationRows(forms);
  renderLearningPanel(forms);
}

function render() {
  elements.regionControl.querySelector(`input[value="${state.region}"]`).checked = true;
  elements.input.value = state.verb.infinitive;
  renderVerbHeading();
  renderMoodTabs();
  renderTenseTabs();
  renderResults();
}

function selectVerb(infinitive) {
  const normalized = normalizeInfinitive(infinitive);
  try {
    state.verb = findVerb(normalized) || createRegularVerb(normalized);
    state.mood = "indicative";
    state.tense = "present";
    state.selectedPersonIndex = 0;
    elements.error.hidden = true;
    const url = new URL(location.href);
    url.searchParams.set("verb", state.verb.infinitive);
    url.hash = "";
    history.replaceState(null, "", url);
    render();
  } catch (error) {
    elements.error.textContent = error.message;
    elements.error.hidden = false;
    elements.input.focus();
  }
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  selectVerb(elements.input.value);
});

// Picking a datalist suggestion fires an input event that is not ordinary typing
// (insertReplacementText, or no inputType at all in some browsers), so show it right away.
elements.input.addEventListener("input", (event) => {
  const picked = event.inputType === undefined || event.inputType === "insertReplacementText";
  if (!picked || !findVerb(elements.input.value)) return;
  selectVerb(elements.input.value);
  elements.input.blur();
});

document.querySelectorAll(".quick-verb").forEach((button) => {
  button.addEventListener("click", () => selectVerb(button.dataset.verb));
});

// Escape hides the region tooltip until the pointer or focus leaves the control.
elements.regionControl.addEventListener("keydown", (event) => {
  if (event.key === "Escape") elements.regionControl.classList.add("tip-dismissed");
});
elements.regionControl.addEventListener("mouseleave", () => elements.regionControl.classList.remove("tip-dismissed"));
elements.regionControl.addEventListener("focusout", (event) => {
  if (!elements.regionControl.contains(event.relatedTarget)) elements.regionControl.classList.remove("tip-dismissed");
});

elements.regionControl.addEventListener("change", (event) => {
  state.region = event.target.value;
  localStorage.setItem("spangler-region", state.region);
  renderResults();
});

elements.surprise.addEventListener("click", () => {
  const choices = VERBS.filter((verb) => verb.infinitive !== state.verb.infinitive);
  selectVerb(choices[Math.floor(Math.random() * choices.length)].infinitive);
});

if (speechSupported) {
  elements.pronounce.addEventListener("click", () => speak(state.verb.infinitive));
  // Chrome loads voices asynchronously; asking early makes them ready by the first click.
  speechSynthesis.getVoices();
} else {
  console.log("Speech is not supported by this browser.");
  elements.pronounce.remove();
  elements.list.classList.add("without-speech");
}

renderSuggestions();
render();
