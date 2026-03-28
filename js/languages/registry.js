const languages = {};

function register(lang) {
  languages[lang.id] = lang;
}

function getLanguage(id) {
  const lang = languages[id];
  if (!lang) {
    throw new Error(`Unknown language: "${id}". Available: ${Object.keys(languages).join(', ')}`);
  }
  return lang;
}

function listLanguages() {
  return Object.values(languages);
}

export { register, getLanguage, listLanguages };
