// client/src/components/NoteListPane.jsx
import { useMemo, useState, useEffect } from "react";
import CardThumbnail from "./CardThumbnail"; // live canvas preview
import { MoreVertical, FileText } from "lucide-react";

function isToday(d) {
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

function fmtFooter(dt) {
  const d = new Date(dt);
  if (isToday(d)) {
    return `Opened Today, ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  return `Opened ${d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function useBuckets(notes) {
  return useMemo(() => {
    const map = new Map();
    const todayItems = [];
    for (const n of notes) {
      const d = new Date(n.updated_at || n.created_at || Date.now());
      if (isToday(d)) {
        todayItems.push(n);
      } else {
        const y = String(d.getFullYear());
        if (!map.has(y)) map.set(y, { title: y, items: [] });
        map.get(y).items.push(n);
      }
    }
    const sections = [];
    if (todayItems.length) sections.push({ id: "today", title: "Today", items: todayItems });
    const years = Array.from(map.keys()).sort((a, b) => Number(b) - Number(a));
    for (const y of years) sections.push({ id: `y-${y}`, title: y, items: map.get(y).items });
    return sections;
  }, [notes]);
}

function KebabMenu({ onRename, onDelete, onClose }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-600 bg-gray-800 shadow-xl backdrop-blur-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => { onClose(); onRename(); }}
        className="block w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors"
      >
        Rename
      </button>
      <button
        onClick={() => { onClose(); onDelete(); }}
        className="block w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-900/30 transition-colors"
      >
        Delete
      </button>
    </div>
  );
}

export default function NoteListPane({
  notes,
  onSelect,       
  onTogglePin,    
  onRename,       
  onDelete,       // (id) => void
}) {
  const sections = useBuckets(notes);
  const [menuId, setMenuId] = useState(null);
  useEffect(() => setMenuId(null), [notes]);

  return (
    <div className="h-full overflow-y-auto bg-[#1e1e1e] px-8 py-8">
      {sections.map((sec) => (
        <section key={sec.id} className="mb-12">
          <h3 className="mb-8 text-2xl font-bold text-gray-200 tracking-tight">{sec.title}</h3>

          {/* Grid layout matching Apple Freeform design */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {sec.items.map((n) => {
              const openedText = fmtFooter(n.updated_at || n.created_at);
              return (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(n.id)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(n.id)}
                  className="group relative cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1"
                >
                  {/* Card matching Apple Freeform style */}
                  <div className="overflow-hidden rounded-2xl bg-white shadow-lg group-hover:shadow-xl transition-all duration-200">
                    {/* White preview area */}
                    <CardThumbnail note={n} className="aspect-[4/3] w-full" />
                    
                    {/* Dark footer */}
                    <div className="bg-gray-700 px-4 py-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-semibold text-white leading-tight">
                            {n.title || "Untitled"}
                          </h3>
                          <p className="text-sm text-gray-300 mt-1.5 font-medium">{openedText}</p>
                        </div>
                        <div className="relative ml-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setMenuId((id) => (id === n.id ? null : n.id))}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-600 hover:text-gray-200 transition-all duration-150"
                            title="More"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {menuId === n.id && (
                            <KebabMenu
                              onRename={() => onRename?.(n)}
                              onDelete={() => onDelete?.(n.id)}
                              onClose={() => setMenuId(null)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
