import { useEffect, useRef } from 'react';
import { editor } from 'monaco-editor';
import type { EditorPosition } from './EditBuffers';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import HtmlWorker from 'monaco-editor/language/html/html.worker?worker';
import CssWorker from 'monaco-editor/language/css/css.worker?worker';
import ScriptWorker from 'monaco-editor/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    if (label === 'html') return new HtmlWorker();
    if (label === 'css') return new CssWorker();
    if (label === 'javascript' || label === 'typescript') return new ScriptWorker();
    return new EditorWorker();
  },
};

function language(path: string) {
  if (/\.html?$/i.test(path)) return 'html';
  if (/\.css$/i.test(path)) return 'css';
  return /\.(js|mjs|cjs)$/i.test(path) ? 'javascript' : 'plaintext';
}

export function MonacoSource({ path, source, readOnly, onChange, initialPosition, onPositionChange }: {
  path: string; source: string; readOnly: boolean; onChange(value: string): void;
  initialPosition?: EditorPosition;
  onPositionChange?(position: EditorPosition): void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const instance = useRef<editor.IStandaloneCodeEditor | null>(null);
  const latest = useRef({ source, readOnly, onChange, onPositionChange });
  latest.current = { source, readOnly, onChange, onPositionChange };
  const applying = useRef(false);

  useEffect(() => {
    if (!host.current) return;
    const model = editor.createModel(latest.current.source, language(path));
    const view = editor.create(host.current, {
      model, theme: 'vs-dark', automaticLayout: true, readOnly: latest.current.readOnly,
      ariaLabel: `Source for ${path}`, minimap: { enabled: false }, links: false,
    });
    if (initialPosition) {
      view.setSelection(initialPosition.selection);
      view.setScrollPosition({ scrollTop: initialPosition.scrollTop, scrollLeft: initialPosition.scrollLeft });
    }
    const reportPosition = () => {
      const selection = view.getSelection();
      if (!selection) return;
      latest.current.onPositionChange?.({
        selection: {
          startLineNumber: selection.startLineNumber, startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber, endColumn: selection.endColumn,
        },
        scrollTop: view.getScrollTop(), scrollLeft: view.getScrollLeft(),
      });
    };
    const listener = model.onDidChangeContent(() => {
      if (!applying.current) latest.current.onChange(model.getValue(undefined, true));
    });
    const selectionListener = view.onDidChangeCursorSelection(reportPosition);
    const scrollListener = view.onDidScrollChange(reportPosition);
    instance.current = view;
    return () => {
      reportPosition();
      instance.current = null;
      listener.dispose();
      selectionListener.dispose();
      scrollListener.dispose();
      view.dispose();
      model.dispose();
    };
  }, [path]);

  useEffect(() => {
    const model = instance.current?.getModel();
    if (model && model.getValue(undefined, true) !== source) {
      applying.current = true;
      model.setValue(source);
      applying.current = false;
    }
    instance.current?.updateOptions({ readOnly });
  }, [source, readOnly]);

  return <div ref={host} className="monaco-view" />;
}

export function MonacoDiff({ path, original, proposed }: { path: string; original: string; proposed: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    const base = editor.createModel(original, language(path));
    const edited = editor.createModel(proposed, language(path));
    const diff = editor.createDiffEditor(host.current, {
      theme: 'vs-dark', automaticLayout: true, readOnly: true, originalEditable: false,
      ignoreTrimWhitespace: false, links: false, originalAriaLabel: 'Original source', modifiedAriaLabel: 'Proposed source',
    });
    diff.setModel({ original: base, modified: edited });
    return () => { diff.dispose(); base.dispose(); edited.dispose(); };
  }, [path, original, proposed]);
  return <div ref={host} className="monaco-view" />;
}
