// client/src/components/ViewToggle.jsx
import React from "react";
import { LayoutGrid, List } from "lucide-react";

export default function ViewToggle({ viewMode, setViewMode }) {
  return (
    <div className="flex items-center rounded-xl bg-gray-800 p-1">
      <button
        onClick={() => setViewMode("grid")}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
          viewMode === "grid"
            ? "bg-gray-700 text-white shadow-sm"
            : "text-gray-400 hover:text-gray-200 hover:bg-gray-750"
        }`}
        title="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => setViewMode("list")}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
          viewMode === "list"
            ? "bg-gray-700 text-white shadow-sm"
            : "text-gray-400 hover:text-gray-200 hover:bg-gray-750"
        }`}
        title="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
