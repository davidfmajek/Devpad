// client/src/pages/Dashboard.jsx
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../AuthContext";
import { listNotes, updateNote, deleteNote } from "../api";
import NoteListPane from "../components/NoteListPane";
import ViewToggle from "../components/ViewToggle";
import NoteList from "../components/NoteList";
import NoteGrid from "../components/NoteGrid";
import { Search, Plus, LogOut, Clock, Star, FileText, LayoutGrid, List } from "lucide-react";

// Helper function to check if a date is today
function isToday(d) {
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

// Helper function to group notes by date and pinned status
function groupNotesByDate(notes) {
  const map = new Map();
  const todayItems = [];
  const pinnedItems = [];
  
  // First separate pinned items
  const unpinnedNotes = notes.filter(note => {
    if (note.pinned) {
      pinnedItems.push(note);
      return false;
    }
    return true;
  });
  
  // Group remaining notes by date
  for (const note of unpinnedNotes) {
    const d = new Date(note.updated_at || note.created_at || Date.now());
    if (isToday(d)) {
      todayItems.push(note);
    } else {
      const year = String(d.getFullYear());
      if (!map.has(year)) {
        map.set(year, { id: `year-${year}`, title: year, items: [] });
      }
      map.get(year).items.push(note);
    }
  }
  
  const sections = [];
  
  // Add pinned section if there are pinned items
  if (pinnedItems.length > 0) {
    sections.push({ 
      id: 'pinned', 
      title: 'Pinned', 
      icon: <Star className="w-4 h-4 mr-2" />,
      items: pinnedItems 
    });
  }
  
  // Add today's notes
  if (todayItems.length > 0) {
    sections.push({ 
      id: 'today', 
      title: 'Today', 
      icon: <Clock className="w-4 h-4 mr-2" />,
      items: todayItems 
    });
  }
  
  // Add notes grouped by year
  const years = Array.from(map.keys()).sort((a, b) => Number(b) - Number(a));
  for (const year of years) {
    const yearData = map.get(year);
    if (yearData.items.length > 0) {
      sections.push({
        ...yearData,
        icon: <FileText className="w-4 h-4 mr-2" />
      });
    }
  }
  
  return sections;
}

export default function Dashboard() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedNote, setSelectedNote] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notes on component mount
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchNotes = async () => {
      try {
        const data = await listNotes(token);
        setNotes(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        setLoading(false);
      }
    };

    fetchNotes();
  }, [token, navigate]);

  const handleCreateNote = () => {
    navigate('/notes/new');
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await deleteNote(token, noteId);
      setNotes(notes.filter((note) => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content_md || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group notes by date and pinned status
  const groupedNotes = groupNotesByDate(filteredNotes);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Rename a note
  const handleRename = async (note) => {
    const newTitle = prompt("Enter new title:", note.title);
    if (!newTitle || newTitle === note.title) return;
    try {
      await updateNote(token, note.id, { title: newTitle });
      setNotes((prevNotes) =>
        prevNotes.map((n) => (n.id === note.id ? { ...n, title: newTitle } : n))
      );
    } catch (error) {
      console.error("Failed to rename note:", error);
    }
  };

  // Toggle pin (favorite) from the list
  const handleTogglePin = async (note) => {
    try {
      const updatedNote = await updateNote(token, note.id, {
        ...note,
        pinned: !note.pinned,
      });
      setNotes((prevNotes) =>
        prevNotes.map((n) => (n.id === note.id ? updatedNote : n))
      );
      
      // Update selected note if it's the one being pinned
      if (selectedNote?.id === note.id) {
        setSelectedNote(updatedNote);
      }
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  // Handle note selection
  const handleSelectNote = (note) => {
    setSelectedNote(note);
    // On mobile, close the preview after selection
    if (window.innerWidth < 1024) {
      // Logic to navigate to the note editor
      navigate(`/notes/${note.id}`);
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Top bar */}
      <div className="w-full bg-[#1e1e1e] px-8 py-6">
        <div className="flex items-center justify-between w-full">
          {/* Left side - Title */}
          <div className="flex-shrink-0">
            <h1 className="text-4xl font-bold text-orange-500 tracking-tight">Recents</h1>
          </div>

          {/* Right side - Action buttons and search */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* New (icon only) */}
            <button
              onClick={() => navigate("/notes/new")}
              className="inline-flex h-8 w-8 items-center justify-center text-gray-400 hover:text-white transition-colors"
              title="New Note"
              aria-label="New Note"
            >
              <Plus className="h-5 w-5" />
            </button>

            {/* Grid view button */}
            <button
              onClick={() => setViewMode("grid")}
              className={`inline-flex h-8 w-8 items-center justify-center transition-colors ${
                viewMode === "grid" ? "text-white" : "text-gray-400 hover:text-white"
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>

            {/* List view button */}
            <button
              onClick={() => setViewMode("list")}
              className={`inline-flex h-8 w-8 items-center justify-center transition-colors ${
                viewMode === "list" ? "text-white" : "text-gray-400 hover:text-white"
              }`}
              title="List view"
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </button>

            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 rounded-md bg-gray-800 px-3 py-1.5 pl-9 text-sm text-gray-200 placeholder-gray-500 border-0 focus:bg-gray-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Logout (icon only) */}
            <button
              onClick={logout}
              className="inline-flex h-8 w-8 items-center justify-center text-gray-400 hover:text-white transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="h-[calc(100vh-80px)] overflow-y-auto px-8 py-6">
        {viewMode === "grid" ? (
          <NoteListPane
            notes={filteredNotes}
            selectedId={null}
            onSelect={(id) => navigate(`/notes/${id}`)}
            onTogglePin={handleTogglePin}
            onRename={handleRename}
            onDelete={handleDeleteNote}
          />
        ) : (
          <div>
            {groupedNotes.map((section) => (
              <div key={section.id} className="mb-8">
                <h2 className="mb-6 text-xl font-semibold text-gray-200 flex items-center">
                  {section.icon}
                  {section.title}
                </h2>
                <NoteList
                  notes={section.items}
                  onSelect={(id) => navigate(`/notes/${id}`)}
                  onRename={handleRename}
                  onDelete={handleDeleteNote}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-red-900/80 border border-red-700 px-6 py-4 text-sm text-red-200 shadow-lg backdrop-blur-sm">
          {error}
        </div>
      )}
    </div>
  );
}
