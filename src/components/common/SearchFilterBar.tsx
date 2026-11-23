import React from 'react';
import { Search, X, Filter } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  selectedValue: string;
}

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filterGroups?: FilterGroup[];
  onFilterChange?: (groupId: string, value: string) => void;
  onResetFilters?: () => void;
  totalResults?: number;
  rightAction?: React.ReactNode;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterGroups = [],
  onFilterChange,
  onResetFilters,
  totalResults,
  rightAction,
}) => {
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    filterGroups.some((g) => g.selectedValue && g.selectedValue !== 'all');

  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/80 shadow-subtle mb-4 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full text-sm pl-9 pr-8 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter dropdowns and right action */}
        <div className="flex flex-wrap items-center gap-2">
          {filterGroups.map((group) => (
            <div key={group.id} className="relative inline-flex items-center">
              <select
                value={group.selectedValue}
                onChange={(e) => onFilterChange && onFilterChange(group.id, e.target.value)}
                className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors cursor-pointer"
              >
                {group.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {group.label}: {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {hasActiveFilters && onResetFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600 px-2.5 py-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Filter className="w-3 h-3" />
              Reset
            </button>
          )}

          {rightAction}
        </div>
      </div>

      {typeof totalResults === 'number' && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-700 font-semibold">{totalResults}</strong> records
          </span>
          {hasActiveFilters && (
            <span className="text-brand-600 font-medium">Filters applied</span>
          )}
        </div>
      )}
    </div>
  );
};
