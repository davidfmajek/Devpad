import { useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

export function MarkdownEditor({ value, onChange, className = '' }) {
  const extensions = useMemo(
    () => [
      markdown(),
      oneDark,
      EditorView.lineWrapping,
    ],
    []
  );

  const handleChange = useCallback(
    (val) => {
      onChange(val);
    },
    [onChange]
  );

  return (
    <div className={`h-full ${className}`}>
      <CodeMirror
        value={value}
        onChange={handleChange}
        extensions={extensions}
        theme="dark"
        className="h-full text-sm"
        basicSetup={{
          lineNumbers: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          tabSize: 2,
        }}
      />
    </div>
  );
}
