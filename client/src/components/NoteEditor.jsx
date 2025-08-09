import React, { useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";

export default function NoteEditor({ value, onChange, readOnly = false }) {
  const extensions = useMemo(() => [markdown()], []);
  // keep local state to avoid cursor jumps while typing
  const [local, setLocal] = useState(value || "");
  const first = useRef(true);

  // sync when external value changes (switching notes)
  useEffect(() => {
    if (first.current) { first.current = false; setLocal(value || ""); return; }
    setLocal(value || "");
  }, [value]);

  return (
    <div className="h-full">
      <CodeMirror
        value={local}
        height="100%"
        theme={oneDark}
        extensions={extensions}
        readOnly={readOnly}
        basicSetup={{ lineNumbers: true, highlightActiveLine: true }}
        onChange={(val) => {
          setLocal(val);
          onChange?.(val);
        }}
      />
    </div>
  );
}
