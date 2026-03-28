import { getLanguage } from './languages/registry.js';

let currentLangId = localStorage.getItem('graphscript-code-lang') || 'javascript';

function setLanguage(id) {
  currentLangId = id;
  localStorage.setItem('graphscript-code-lang', id);
}

function getLanguageId() {
  return currentLangId;
}

function runScript(code, graphData) {
  const lang = getLanguage(currentLangId);
  return lang.run(code, graphData);
}

export { runScript, setLanguage, getLanguageId };
