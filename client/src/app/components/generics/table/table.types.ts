/**
 * Table Component — Types & Interfaces
 * Generic, fully-typed, SOLID-compliant table system.
 */

/** Column sort direction */
export type SortDirection = 'asc' | 'desc' | null;

/** Filter option for select-type filters */
export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

/** Column definition */
export interface TableColumn<T> {
  /** Property key on the data object (supports dot-notation: 'address.city') */
  key       : keyof T | string;
  /** Display header label */
  label     : string;
  /** Whether column can be sorted (default: true) */
  sortable? : boolean;
  /** Width hint e.g. '120px', '10%' (optional) */
  width?    : string;
  /** Custom cell formatter */
  formatter?: (value: unknown, row: T) => string;
  /** Render as badge. Key = value, Value = badge color class */
  badge?    : Record<string, string>;
  /** If true, clicking the cell value copies it */
  copyable? : boolean;
}

/** Row action */
export interface TableAction<T> {
  /** Unique key for the action */
  key     : string;
  /** Display label */
  label   : string;
  /** Lucide icon name */
  icon    : string;
  /** CSS color class for the action (e.g. 'action-danger') */
  variant?: 'default' | 'danger' | 'success';
  /** Whether to hide the action for a given row */
  hidden? : (row: T) => boolean;
}

/** Edit field type */
export type EditFieldType = 'text' | 'number' | 'email' | 'select' | 'date' | 'readonly';

/** Edit field definition — controls inline editing */
export interface EditField<T> {
  /** Must match the column key */
  key       : keyof T | string;
  type      : EditFieldType;
  /** Options for select type */
  options?  : FilterOption[];
  /** Validation: returns error message or null */
  validate? : (value: unknown) => string | null;
}

/** Pagination info (server-side capable) */
export interface PaginationConfig {
  pageSize  : number;
  pageSizes?: number[];
}

/** Data source — url OR localData must be provided */
export interface TableDataSource<T> {
  /** REST endpoint — GET returns { success, data: T[] } */
  url?      : string;
  /** Local data array */
  localData?: T[];
}

/** Full table configuration passed from parent */
export interface TableConfig<T> {
  columns      : TableColumn<T>[];
  dataSource   : TableDataSource<T>;
  actions?     : TableAction<T>[];
  editFields?  : EditField<T>[];
  pagination?  : PaginationConfig;
  /** Row id property (default: 'id') */
  idKey?       : string;
  /** Enable create button in table header */
  showCreate?  : boolean;
  /** Label for the create button */
  createLabel? : string;
  /** Whether the table is searchable */
  searchable?  : boolean;
}
