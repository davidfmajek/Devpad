import { Link } from 'react-router-dom';
import { Star, MoreVertical, Clock } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export function NoteCard({ note, onSelect, onDelete, isSelected }) {
  const handleClick = (e) => {
    // Only trigger select if the click wasn't on a button or link
    if (!e.target.closest('button, a')) {
      onSelect?.(note);
    }
  };

  const handlePinClick = (e) => {
    e.stopPropagation();
    // Toggle pinned status - this should be handled by the parent
    onSelect?.({ ...note, pinned: !note.pinned });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete?.(note.id);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`relative group rounded-lg border overflow-hidden transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'ring-2 ring-blue-500 border-blue-500' 
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
      } bg-white dark:bg-gray-800 hover:shadow-md flex flex-col h-full`}
    >
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
            {note.title || 'Untitled Note'}
          </h3>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="p-1 text-gray-400 hover:text-yellow-400"
              onClick={handlePinClick}
              title={note.pinned ? 'Unpin note' : 'Pin note'}
            >
              <Star 
                className={`h-4 w-4 ${note.pinned ? 'fill-yellow-400 text-yellow-400' : ''}`} 
              />
            </button>
            
            <div className="relative">
              <button 
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={handleDelete}
                title="Delete note"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 mb-3 overflow-hidden">
          {note.content_md ? (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
              {note.content_md.replace(/[#*`\[\]]/g, '')}
            </p>
          ) : (
            <p className="text-gray-400 italic text-sm">No content</p>
          )}
        </div>
        
        <div className="mt-auto flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{formatDate(note.updated_at || note.created_at)}</span>
          </div>
          
          <Link 
            to={`/notes/${note.id}`}
            className="text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap ml-2"
            onClick={(e) => e.stopPropagation()}
          >
            Open
          </Link>
        </div>
      </div>
      
      {/* Thumbnail preview for diagrams */}
      {note.diagram_data && (
        <div className="h-24 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center">
          <div className="text-xs text-gray-400">Diagram preview</div>
        </div>
      )}
    </div>
  );
}
