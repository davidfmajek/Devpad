import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function truncate(str, length = 100) {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function generateThumbnail(content) {
  // Simple thumbnail generation - in a real app, you might want to generate
  // a visual representation of the content
  if (!content) return '';
  
  // Remove markdown syntax for the thumbnail
  const plainText = content
    .replace(/^#+\s+/gm, '') // Headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/```[\s\S]*?```/g, '') // Code blocks
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '') // Images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // Links
    .replace(/\n\s*\n/g, '\n') // Multiple newlines
    .trim();
    
  return truncate(plainText, 100);
}
