import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';

import { LoaderComponent } from '../loader/loader.component';
import { ButtonComponent } from '../button/button.component';
import { MinPipe } from './min.pipe';
import {
  TableConfig,
  TableColumn,
  TableAction,
  SortDirection,
  EditField,
  FilterOption,
} from './table.types';

interface SortState {
  key      : string;
  direction: SortDirection;
}

interface FilterState {
  key  : string;
  value: string;
}

interface DeleteConfirmState {
  rowId    : unknown;
  anchorEl?: HTMLElement;
}

@Component({
  selector        : 'app-table',
  standalone      : true,
  imports         : [CommonModule, FormsModule, LoaderComponent, ButtonComponent, MinPipe],
  templateUrl     : './table.component.html',
  styleUrl        : './table.component.css',
  changeDetection : ChangeDetectionStrategy.OnPush,
  animations      : [
    trigger('rowsIn', [
      transition(':enter', [
        query('.table-row', [
          style({ opacity: 0, transform: 'translateY(6px)' }),
          stagger(30, [
            animate('240ms cubic-bezier(0.16, 1, 0.3, 1)',
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('rowFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(4px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-4px)' }))
      ])
    ]),
    trigger('islandPop', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.88) translateY(8px)' }),
        animate('220ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms cubic-bezier(0.7, 0, 0.84, 0)',
          style({ opacity: 0, transform: 'scale(0.88) translateY(8px)' }))
      ])
    ]),
  ]
})
export class TableComponent<T extends Record<string, unknown>> implements OnInit {
  config = input.required<TableConfig<T>>();

  /** Emits when the parent should open the create modal */
  onCreate = output<void>();

  /** Emits (action key, row) when a row action is triggered (except edit/delete) */
  onAction = output<{ action: string; row: T }>();

  /** Emits (row) when an inline edit is saved */
  onEdit = output<T>();

  /** Emits (id) when a delete is confirmed */
  onDelete = output<unknown>();

  private readonly http       = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  protected loading   = signal(false);
  protected rawData   = signal<T[]>([]);
  protected sortState = signal<SortState>({ key: '', direction: null });
  protected filters   = signal<FilterState[]>([]);
  protected searchRaw = signal('');
  protected page      = signal(1);

  protected activeFilterKey  = signal<string | null>(null);
  protected activeMenuRowId  = signal<unknown>(null);
  protected editingRowId     = signal<unknown>(null);
  protected editingRowData   = signal<Record<string, unknown>>({});
  protected deleteConfirm    = signal<DeleteConfirmState | null>(null);
  protected deleteAnchorPos  = signal<{ top: number; left: number } | null>(null);

  private searchSubject = new Subject<string>();

  protected pageSize = computed(() =>
    this.config().pagination?.pageSize ?? 10
  );

  protected pageSizes = computed(() =>
    this.config().pagination?.pageSizes ?? [5, 10, 25, 50]
  );

  /** Apply search + filter + sort */
  protected filteredData = computed<T[]>(() => {
    const search  = this.searchRaw().toLowerCase().trim();
    const filters = this.filters();
    const sort    = this.sortState();
    let data     = [...this.rawData()];

    // Search
    if (search) {
      data = data.filter(row =>
        this.config().columns.some(col => {
          const val = this.getCellValue(row, String(col.key));
          return String(val ?? '').toLowerCase().includes(search);
        })
      );
    }

    // Column filters (reorder only — implemented as active sort)
    // Filter values act as column-level search
    for (const f of filters) {
      if (f.value !== '') {
        data = data.filter(row => {
          const val = String(this.getCellValue(row, f.key) ?? '').toLowerCase();
          return val.includes(f.value.toLowerCase());
        });
      }
    }

    // Sort
    if (sort.key && sort.direction) {
      data = [...data].sort((a, b) => {
        const av = this.getCellValue(a, sort.key) ?? '';
        const bv = this.getCellValue(b, sort.key) ?? '';
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sort.direction === 'asc' ? cmp : -cmp;
      });
    }

    return data;
  });

  protected totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredData().length / this.pageSize()))
  );

  protected pageData = computed<T[]>(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredData().slice(start, start + this.pageSize());
  });

  protected pageNumbers = computed<number[]>(() => {
    const total = this.totalPages();
    const cur   = this.page();
    const delta = 2;
    const pages: number[] = [];
    for (let i = Math.max(1, cur - delta); i <= Math.min(total, cur + delta); i++) {
      pages.push(i);
    }
    return pages;
  });

  protected idKey = computed(() => this.config().idKey ?? 'id');

  constructor() {
    // Debounced search
    this.searchSubject.pipe(
      debounceTime(280),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(v => {
      this.searchRaw.set(v);
      this.page.set(1);
    });

    // When config changes & has URL, fetch
    effect(() => {
      const cfg = this.config();
      if (cfg.dataSource.url) {
        this.fetchData();
      } else if (cfg.dataSource.localData) {
        this.rawData.set(cfg.dataSource.localData);
      }
    });
  }

  ngOnInit(): void {}

  /** Parent calls this after a create/update/delete to force refetch */
  public refresh(): void {
    const cfg = this.config();
    if (cfg.dataSource.url) {
      this.fetchData();
    } else if (cfg.dataSource.localData) {
      this.rawData.set([...cfg.dataSource.localData]);
    }
  }

  private fetchData(): void {
    const url = this.config().dataSource.url;
    if (!url) return;

    this.loading.set(true);
    this.http.get<{ success: boolean; data: T[] }>(url)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rawData.set(res.data ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  protected toggleSort(key: string): void {
    const cur = this.sortState();
    if (cur.key !== key) {
      this.sortState.set({ key, direction: 'asc' });
    } else {
      const next: SortDirection =
        cur.direction === null   ? 'asc'  :
        cur.direction === 'asc'  ? 'desc' : null;
      this.sortState.set({ key, direction: next });
    }
    this.page.set(1);
  }

  protected getSortIcon(key: string): string {
    const s = this.sortState();
    if (s.key !== key || !s.direction) return 'ChevronsUpDown';
    return s.direction === 'asc' ? 'ChevronUp' : 'ChevronDown';
  }

  protected toggleFilterPanel(key: string): void {
    this.activeFilterKey.update(v => v === key ? null : key);
  }

  protected getFilterValue(key: string): string {
    return this.filters().find(f => f.key === key)?.value ?? '';
  }

  protected setFilter(key: string, value: string): void {
    this.filters.update(fs => {
      const idx = fs.findIndex(f => f.key === key);
      if (idx >= 0) {
        const updated = [...fs];
        updated[idx] = { key, value };
        return updated;
      }
      return [...fs, { key, value }];
    });
    this.page.set(1);
  }

  protected clearFilter(key: string): void {
    this.filters.update(fs => fs.filter(f => f.key !== key));
  }

  protected hasActiveFilter(key: string): boolean {
    const f = this.filters().find(f => f.key === key);
    return !!f && f.value !== '';
  }

  protected onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  protected clearSearch(inputEl: HTMLInputElement): void {
    inputEl.value = '';
    this.searchSubject.next('');
  }

  protected setPage(p: number): void {
    const clamped = Math.max(1, Math.min(p, this.totalPages()));
    this.page.set(clamped);
  }

  protected setPageSize(size: number): void {
    const cfg = this.config();
    // Mutate pagination inline (safe since signal holds the config reference)
    if (cfg.pagination) cfg.pagination.pageSize = size;
    this.page.set(1);
  }

  protected getCellValue(row: T, key: string): unknown {
    const parts = key.split('.');
    let val: unknown = row;
    for (const part of parts) {
      if (val == null || typeof val !== 'object') return undefined;
      val = (val as Record<string, unknown>)[part];
    }
    return val;
  }

  protected getDisplayValue(row: T, col: TableColumn<T>): string {
    const raw = this.getCellValue(row, String(col.key));
    if (col.formatter) return col.formatter(raw, row);
    if (raw == null) return '—';
    return String(raw);
  }

  protected toggleActionMenu(rowId: unknown, event: MouseEvent): void {
    event.stopPropagation();
    this.activeMenuRowId.update(id => id === rowId ? null : rowId);
    this.deleteConfirm.set(null);
  }

  protected closeMenus(): void {
    this.activeMenuRowId.set(null);
    this.activeFilterKey.set(null);
    this.deleteConfirm.set(null);
    this.deleteAnchorPos.set(null);
  }

  protected handleAction(action: TableAction<T>, row: T, event: MouseEvent): void {
    event.stopPropagation();
    this.activeMenuRowId.set(null);

    if (action.key === 'edit') {
      this.startEdit(row);
      return;
    }
    if (action.key === 'delete') {
      this.requestDelete(row, event);
      return;
    }
    this.onAction.emit({ action: action.key, row });
  }

  protected visibleActions(row: T): TableAction<T>[] {
    return (this.config().actions ?? []).filter(a => !a.hidden?.(row));
  }

  /** Standard CRUD actions: edit & delete are "primary", others go in the sub-menu */
  protected primaryActions(row: T): TableAction<T>[] {
    return this.visibleActions(row).filter(a => a.key === 'edit' || a.key === 'delete');
  }

  protected extraActions(row: T): TableAction<T>[] {
    return this.visibleActions(row).filter(a => a.key !== 'edit' && a.key !== 'delete');
  }

  /* ------------------------------------------------------------------ */
  /*  INLINE EDIT                                                        */
  /* ------------------------------------------------------------------ */
  protected startEdit(row: T): void {
    this.editingRowId.set(row[this.idKey()]);
    // Deep-clone row into editing buffer
    this.editingRowData.set({ ...(row as Record<string, unknown>) });
    this.deleteConfirm.set(null);
    this.activeMenuRowId.set(null);
  }

  protected cancelEdit(): void {
    this.editingRowId.set(null);
    this.editingRowData.set({});
  }

  protected saveEdit(): void {
    const data = this.editingRowData() as T;
    this.onEdit.emit(data);
    this.editingRowId.set(null);
    this.editingRowData.set({});
  }

  protected getEditValue(key: string): unknown {
    return this.editingRowData()[key];
  }

  protected setEditValue(key: string, value: unknown): void {
    this.editingRowData.update(d => ({ ...d, [key]: value }));
  }

  protected getEditField(key: string): EditField<T> | undefined {
    return this.config().editFields?.find(f => String(f.key) === key);
  }

  /* ------------------------------------------------------------------ */
  /*  DELETE CONFIRM ISLAND                                              */
  /* ------------------------------------------------------------------ */
  protected requestDelete(row: T, event: MouseEvent): void {
    event.stopPropagation();
    const rowId = row[this.idKey()];
    const btn   = event.currentTarget as HTMLElement;
    const rect  = btn.getBoundingClientRect();
    this.deleteAnchorPos.set({
      top : rect.bottom + 8 + window.scrollY,
      left: rect.left + rect.width / 2,
    });
    this.deleteConfirm.set({ rowId });
    this.activeMenuRowId.set(null);
  }

  protected confirmDelete(): void {
    const state = this.deleteConfirm();
    if (!state) return;
    this.onDelete.emit(state.rowId);
    this.deleteConfirm.set(null);
    this.deleteAnchorPos.set(null);
  }

  protected cancelDelete(): void {
    this.deleteConfirm.set(null);
    this.deleteAnchorPos.set(null);
  }

  /* ------------------------------------------------------------------ */
  /*  HELPERS                                                            */
  /* ------------------------------------------------------------------ */
  protected getBadgeClass(col: TableColumn<T>, row: T): string {
    if (!col.badge) return '';
    const val = String(this.getCellValue(row, String(col.key)) ?? '');
    return col.badge[val] ?? 'badge-default';
  }

  protected isEditing(row: T): boolean {
    return this.editingRowId() === row[this.idKey()];
  }

  protected trackById(_: number, item: T): unknown {
    return item[this.idKey()];
  }

  protected getPageSizeOptions(): number[] {
    return this.config().pagination?.pageSizes ?? [5, 10, 25, 50];
  }

  /** Converts a value to string — accessible from Angular templates */
  protected toStr(val: unknown): string {
    return String(val ?? '');
  }

  protected get hasExtraActions(): boolean {
    // at least one row has extra actions
    return (this.config().actions ?? []).some(a => a.key !== 'edit' && a.key !== 'delete');
  }
}
