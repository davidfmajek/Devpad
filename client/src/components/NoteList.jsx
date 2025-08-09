import NoteActions from "./NoteActions";
import CardThumbnail from "./CardThumbnail";

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const noteDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (noteDate.getTime() === today.getTime()) {
    return `Today, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  
  return date.toLocaleDateString([], {
    month: "numeric",
    day: "numeric", 
    year: "2-digit",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default function NoteList({ notes, onSelect, onRename, onDelete }) {
  return (
    <div className="divide-y divide-gray-700 rounded-2xl border border-gray-700 bg-gray-800 shadow-sm">
      {notes.map((note) => (
        <div
          key={note.id}
          onClick={() => onSelect?.(note.id)}
          className="flex items-center gap-4 px-6 py-4 hover:bg-gray-750 cursor-pointer transition-all duration-150 group first:rounded-t-2xl last:rounded-b-2xl"
        >
          {/* Note preview thumbnail */}
          <div className="flex-shrink-0">
            <div className="h-12 w-16 overflow-hidden rounded-lg bg-white border border-gray-600 shadow-sm">
              <CardThumbnail note={note} className="h-full w-full" />
            </div>
          </div>
          
          {/* Title */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-white leading-tight">
              {note.title || "Untitled"}
            </h3>
          </div>

          {/* Timestamp at far right */}
          <div className="hidden text-sm text-gray-400 font-medium sm:block">
            {formatTime(note.updated_at || note.created_at)}
          </div>
          
          {/* Actions */}
          <div 
            className="ml-2 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <NoteActions
              onRename={() => onRename?.(note)}
              onDelete={() => onDelete?.(note.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
