import { t } from './i18n.js';

function runScript(code, graphData) {
  return new Promise((resolve) => {
    const worker = new Worker('js/worker.js');

    const timeout = setTimeout(() => {
      worker.terminate();
      resolve({ success: false, error: t('error.timeout') });
    }, 5000);

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve(e.data);
    };

    worker.onerror = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve({ success: false, error: e.message });
    };

    worker.postMessage({ code, graphData });
  });
}

export { runScript };
