import NoteActions from "./NoteActions";

export default function NoteGrid({ notes, onRename, onDelete }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((n) => (
        <div key={n.id} className="relative rounded border border-gray-700 p-4">
          <div className="absolute right-3 top-3">
            <NoteActions
              onRename={() => onRename(n)}
              onDelete={() => onDelete(n.id)}
            />
          </div>
          <h3 className="pr-10 text-lg font-semibold text-white">{n.title}</h3>
          <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm text-gray-300">{n.content_md}</p>
          <p className="mt-2 text-xs text-gray-400">
            {n.language || "plaintext"} — {new Date(n.updated_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
