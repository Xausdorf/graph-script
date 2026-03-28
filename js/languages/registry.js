const languages = {};

function register(lang) {
  languages[lang.id] = lang;
}

function getLanguage(id) {
  return languages[id];
}

function listLanguages() {
  return Object.values(languages);
}

export { register, getLanguage, listLanguages };
