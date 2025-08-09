import { Link } from 'react-router-dom';
import { Star, MoreVertical, Clock } from 'lucide-react';
import { formatDate, generateThumbnail } from '../../lib/utils';

export function NoteListItem({ note, onSelect, onDelete, isSelected }) {
  const handleClick = (e) => {
    // Only trigger select if the click wasn't on a button or link
    if (!e.target.closest('button, a')) {
      onSelect?.(note);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`group flex items-center p-3 rounded-lg transition-colors ${
        isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-transparent'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate pr-2">
            {note.title || 'Untitled Note'}
          </h3>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="p-1 text-gray-400 hover:text-yellow-400"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle pinned status
              }}
              title={note.pinned ? 'Unpin note' : 'Pin note'}
            >
              <Star 
                className={`h-4 w-4 ${note.pinned ? 'fill-yellow-400 text-yellow-400' : ''}`} 
              />
            </button>
            
            <div className="relative">
              <button 
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  // Show dropdown menu
                }}
                title="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 truncate">
          {note.content_md ? generateThumbnail(note.content_md) : 'No content'}
        </p>
        
        <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Clock className="h-3 w-3 mr-1" />
          <span>{formatDate(note.updated_at || note.created_at)}</span>
          
          {note.diagram_data && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              Diagram
            </span>
          )}
          
          <Link 
            to={`/notes/${note.id}`}
            className="ml-auto text-blue-600 dark:text-blue-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Open
          </Link>
        </div>
      </div>
    </div>
  );
}
