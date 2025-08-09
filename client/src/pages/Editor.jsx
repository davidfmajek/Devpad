import { useEffect, useMemo, useRef, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../AuthContext";
import { listNotes, createNote, updateNote } from "../api";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";

export default function Editor({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();               // undefined in "new" mode
  const { token, logout } = useContext(AuthContext);

  const [note, setNote] = useState(null);
  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const isNew = mode === "new" || !id;
  const cmExtensions = useMemo(() => [markdown()], []);

  // Load existing note (edit mode)
  useEffect(() => {
    if (isNew) return;
    (async () => {
      const all = await listNotes(token);
      const found = all.find((n) => String(n.id) === String(id));
      setNote(found || null);
      setTitle(found?.title || "Untitled");
      setContent(found?.content_md || "");
    })();
  }, [id, isNew, token]);

  // Debounced autosave
  const saveTimer = useRef();
  const triggerSave = async () => {
    if (isNew || !note) return; // for new note we save on first keystroke below
    setSaving(true);
    await updateNote(token, note.id, { title, content_md: content });
    setSaving(false);
  };
  useEffect(() => {
    clearTimeout(saveTimer.current);
    // if new: create on first change to get an ID
    saveTimer.current = setTimeout(async () => {
      if (isNew && !note && (title || content)) {
        setSaving(true);
        const created = await createNote(token, { title, content_md: content });
        setSaving(false);
        // navigate to real ID route so further saves update
        navigate(`/notes/${created.id}`, { replace: true });
        setNote({ id: created.id, title, content_md: content });
        return;
      }
      if (note) await triggerSave();
    }, 600);
    return () => clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, note?.id, isNew]);

  // Cmd/Ctrl+S manual save
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (note) triggerSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [note, title, content]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-gray-100">
      {/* Top toolbar */}
      <div className="flex h-11 items-center justify-between border-b border-gray-800 bg-[#2b2b2b] px-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="rounded bg-black/30 px-2 py-1 text-sm text-gray-200 hover:bg-black/40">←</button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-64 rounded bg-black/30 px-2 py-1 text-sm text-gray-100 placeholder-gray-400 outline-none"
            placeholder="Untitled"
          />
          <div className="ml-2 hidden gap-1 sm:flex">
            {["🗒️","📎","Aa","🖼️","📁"].map((x,i)=>(
              <button key={i} className="rounded bg-black/30 px-2 py-1 text-sm text-gray-200 hover:bg-black/40">{x}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-300">{saving ? "Saving…" : "Saved"}</span>
          <button className="rounded bg-black/30 px-2 py-1 text-sm text-gray-200 hover:bg-black/40">🔗</button>
          <button className="rounded bg-black/30 px-2 py-1 text-sm text-gray-200 hover:bg-black/40">✏️</button>
        </div>
      </div>

      {/* Notebook surface */}
      <div className="notebook-bg h-[calc(100vh-44px)] w-full overflow-auto">
        <div className="mx-auto h-full max-w-5xl p-6">
          <div className="h-[calc(100vh-72px)] rounded-lg bg-transparent">
            <CodeMirror
              value={content}
              onChange={setContent}
              height="100%"
              theme={oneDark}
              extensions={cmExtensions}
              basicSetup={{ lineNumbers: false, highlightActiveLine: true }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Tool({ children }) {
  return (
    <button className="rounded bg-gray-800 px-2 py-1 text-sm text-gray-200 hover:bg-gray-700">
      {children}
    </button>
  );
}
