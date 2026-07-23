import { useEffect, useState } from 'react';
import type { SortDir } from '@/types';

export interface TableQueryState {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string | undefined;
  sortDir: SortDir;
}

export interface UseTableQueryOptions {
  defaultSortBy?: string;
  defaultSortDir?: SortDir;
  defaultPageSize?: number;
  searchDebounceMs?: number;
}

export function useTableQuery(options: UseTableQueryOptions = {}) {
  const { defaultSortBy, defaultSortDir = 'desc', defaultPageSize = 10, searchDebounceMs = 1000 } = options;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>(defaultSortBy);
  const [sortDir, setSortDir] = useState<SortDir>(defaultSortDir);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, searchDebounceMs);
    return () => clearTimeout(timeout);
  }, [searchInput, searchDebounceMs]);

  const searchNow = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleSearchKeyDown = (e: { key: string }) => {
    if (e.key === 'Enter') searchNow();
  };

  const toggleSort = (field: string) => {
    if (sortBy !== field) {
      setSortBy(field);
      setSortDir('asc');
    } else {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    }
    setPage(1);
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return {
    page,
    setPage,
    pageSize,
    setPageSize: changePageSize,
    searchInput,
    setSearchInput,
    handleSearchKeyDown,
    search,
    sortBy,
    sortDir,
    toggleSort,
  };
}
