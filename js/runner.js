import { getLanguage } from './languages/registry.js';

let currentLangId;
try {
  currentLangId = localStorage.getItem('graphscript-code-lang') || 'javascript';
} catch {
  currentLangId = 'javascript';
}

function setLanguage(id) {
  currentLangId = id;
  try {
    localStorage.setItem('graphscript-code-lang', id);
  } catch {
    // localStorage unavailable (private browsing)
  }
}

function getLanguageId() {
  return currentLangId;
}

function runScript(code, graphData) {
  try {
    const lang = getLanguage(currentLangId);
    return lang.run(code, graphData);
  } catch {
    return Promise.resolve({ success: false, error: `Unknown language: ${currentLangId}` });
  }
}

export { runScript, setLanguage, getLanguageId };
