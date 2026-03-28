const translations = {
  ru: {
    'btn.vertex': 'Вершина',
    'btn.edge': 'Ребро',
    'btn.delete': 'Удалить',
    'btn.run': 'Запуск',
    'btn.grid': 'Сетка',
    'btn.directed': 'Ориентированный',
    'tooltip.addVertex': 'Добавить вершину',
    'tooltip.addEdge': 'Соединить две вершины',
    'tooltip.delete': 'Удалить элемент',
    'tooltip.run': 'Запустить скрипт',
    'label.output': 'Вывод',
    'output.placeholder': 'Вывод будет здесь...',
    'mode.default': 'Перемещение',
    'mode.addEdge': 'Добавление ребра',
    'mode.delete': 'Удаление',
    'status.running': 'Выполняется...',
    'error.prefix': 'Ошибка: ',
    'error.timeout': 'Превышен лимит времени (5 сек)',
    'status.loadingPyodide': 'Загрузка Python...',
  },
  en: {
    'btn.vertex': 'Vertex',
    'btn.edge': 'Edge',
    'btn.delete': 'Delete',
    'btn.run': 'Run',
    'btn.grid': 'Grid',
    'btn.directed': 'Directed',
    'tooltip.addVertex': 'Add vertex',
    'tooltip.addEdge': 'Connect two vertices',
    'tooltip.delete': 'Delete element',
    'tooltip.run': 'Run script',
    'label.output': 'Output',
    'output.placeholder': 'Output will appear here...',
    'mode.default': 'Move',
    'mode.addEdge': 'Adding edge',
    'mode.delete': 'Delete',
    'status.running': 'Running...',
    'error.prefix': 'Error: ',
    'error.timeout': 'Time limit exceeded (5s)',
    'status.loadingPyodide': 'Loading Python...',
  },
};

let currentLang = 'ru';
try {
  currentLang = localStorage.getItem('graphscript-lang') || 'ru';
} catch {
  // localStorage may be unavailable (e.g. private browsing, disabled)
}

function t(key) {
  return translations[currentLang]?.[key] || translations['ru'][key] || key;
}

function getLang() {
  return currentLang;
}

function setLang(lang) {
  currentLang = lang;
  try {
    localStorage.setItem('graphscript-lang', lang);
  } catch {
    // localStorage may be unavailable (e.g. private browsing, disabled)
  }
  document.documentElement.lang = lang;
  applyTranslations();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-tooltip]').forEach((el) => {
    el.setAttribute('data-tooltip', t(el.dataset.i18nTooltip));
  });
}

function initI18n() {
  document.documentElement.lang = currentLang;
  applyTranslations();

  const outputEl = document.getElementById('output');
  if (outputEl && !outputEl.className) {
    outputEl.textContent = t('output.placeholder');
  }
}

export { t, getLang, setLang, initI18n, applyTranslations };
