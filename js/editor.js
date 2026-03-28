function initEditor(containerId, initialCode, mode) {
  const editor = CodeMirror(document.getElementById(containerId), {
    value: initialCode,
    mode: mode,
    theme: 'monokai',
    lineNumbers: true,
    lineWrapping: true,
    tabSize: 2,
    indentWithTabs: false,
  });
  return editor;
}

function getCode(editor) {
  return editor.getValue();
}

function setCode(editor, code) {
  editor.setValue(code);
}

function setEditorMode(editor, mode) {
  editor.setOption('mode', mode);
}

export { initEditor, getCode, setCode, setEditorMode };
