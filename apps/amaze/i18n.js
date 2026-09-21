/* Plain scripts keep translations available when index.html is opened from disk. */
const MazeI18n = (() => {
  const locales = globalThis.MazeLocales;
  const preferenceKey = 'abes-maze-language';
  let locale = 'en';
  let numbers = new Intl.NumberFormat(locale), plurals = new Intl.PluralRules(locale);
  function match(language) {
    if (typeof language !== 'string') return undefined;
    const normalized = language.toLowerCase().replaceAll('_', '-');
    return Object.keys(locales).find(code => code.toLowerCase() === normalized)
      || Object.keys(locales).find(code => code === normalized.split('-')[0]);
  }
  function setLocale(language) {
    locale = match(language) || 'en';
    numbers = new Intl.NumberFormat(locale);
    plurals = new Intl.PluralRules(locale);
    return locale;
  }
  function initialize(storage, languages = []) {
    let saved;
    try { saved = match(storage.getItem(preferenceKey)); } catch { /* Session-only preference. */ }
    return setLocale(saved || languages.map(match).find(Boolean) || 'en');
  }
  function remember(language, storage) {
    setLocale(language);
    try { storage.setItem(preferenceKey, locale); } catch { /* Switching still works. */ }
  }
  function number(value) { return numbers.format(value); }
  function t(key, values = {}) {
    let message = locales[locale].messages[key] ?? locales.en.messages[key];
    if (message === undefined) throw new Error('Unknown translation key: ' + key);
    if (typeof message === 'object') {
      const category = plurals.select(values.count);
      message = message[category] ?? message.other;
    }
    return message.replace(/\{(\w+)\}/g, (_, name) => {
      if (!(name in values)) throw new Error('Missing translation value: ' + key + '.' + name);
      return typeof values[name] === 'number' ? number(values[name]) : String(values[name]);
    });
  }
  function render(document) {
    document.documentElement.lang = locale;
    document.documentElement.dir = locales[locale].dir;
    document.querySelectorAll('[data-i18n]').forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });
    for (const attribute of ['aria-label', 'content']) {
      document.querySelectorAll('[data-i18n-' + attribute + ']').forEach(element => {
        element.setAttribute(attribute, t(element.getAttribute('data-i18n-' + attribute)));
      });
    }
  }
  return {locales, preferenceKey, get locale() { return locale; }, setLocale, initialize, remember, number, t, render};
})();
if (typeof module !== 'undefined') module.exports = MazeI18n;
