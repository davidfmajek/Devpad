import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

export default function NoteActions({ onRename, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center rounded-lg p-1.5 text-sm text-gray-400 bg-gray-700 hover:bg-gray-600 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-150"
        aria-haspopup="menu"
        aria-expanded={open}
        title="More"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-gray-600 bg-gray-800 shadow-xl backdrop-blur-xl">
          <button
            className="block w-full px-4 py-3 text-left text-sm font-medium text-gray-200 hover:bg-gray-700 transition-colors"
            onClick={() => { setOpen(false); onRename(); }}
          >
            Rename
          </button>
          <button
            className="block w-full px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors"
            onClick={() => { setOpen(false); onDelete(); }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
