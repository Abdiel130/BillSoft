import {
  Component,
  OnInit,
  signal,
  viewChild,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TableComponent } from '../generics/table/table.component';
import { ModalComponent } from '../generics/modal/modal.component';

import { ButtonComponent } from '../generics/button/button.component';
import { TableConfig, TableColumn, TableAction, EditField } from '../generics/table/table.types';
import { CompaniesService, CompanyPayload } from '../../core/services/companies.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableComponent, ModalComponent, ButtonComponent],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Clients implements OnInit {

  private fb       = inject(FormBuilder);
  private svc      = inject(CompaniesService);

  tableRef = viewChild<TableComponent<Record<string, unknown>>>('tableRef');

  /* ---- MODAL ---- */
  createModalOpen = signal(false);
  createLoading   = signal(false);
  createError     = signal('');

  createForm: FormGroup = this.fb.group({
    rfc        : ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13)]],
    legalName  : ['', Validators.required],
    zipCode    : ['', [Validators.required, Validators.minLength(5), Validators.maxLength(6)]],
    nickname   : [''],
    taxRegimeId: [''],
    type       : ['CLIENT', Validators.required],
  });

  /* ---- TABLE CONFIG ---- */
  readonly tableConfig: TableConfig<Record<string, unknown>> = {
    dataSource : { url: '/api/companies' },
    searchable : true,
    showCreate : true,
    createLabel: 'Nueva Empresa',
    idKey      : 'id',
    pagination : { pageSize: 10, pageSizes: [5, 10, 25, 50] },
    columns    : [
      { key: 'id',          label: 'ID',           sortable: true,  width: '70px' },
      { key: 'rfc',         label: 'RFC',           sortable: true },
      { key: 'legalName',   label: 'Razón Social',  sortable: true },
      { key: 'nickname',    label: 'Alias',         sortable: true, formatter: (v) => v ? String(v) : '—' },
      { key: 'zipCode',     label: 'C.P.',          sortable: true },
      { key: 'taxRegimeId', label: 'Régimen',       sortable: true, formatter: (v) => v ? String(v) : '—' },
      {
        key      : 'type',
        label    : 'Tipo',
        sortable : true,
        badge    : { CLIENT: 'badge-blue', EXTERNAL: 'badge-purple' },
        formatter: (v) => v === 'CLIENT' ? 'Cliente' : 'Externo',
      },
    ] as TableColumn<Record<string, unknown>>[],

    actions: [
      { key: 'edit',   label: 'Editar',   icon: 'Edit',   variant: 'default' },
      { key: 'delete', label: 'Eliminar', icon: 'Trash2', variant: 'danger'  },
    ] as TableAction<Record<string, unknown>>[],

    editFields: [
      { key: 'id',          type: 'readonly' },
      { key: 'rfc',         type: 'text' },
      { key: 'legalName',   type: 'text' },
      { key: 'nickname',    type: 'text' },
      { key: 'zipCode',     type: 'text' },
      { key: 'taxRegimeId', type: 'text' },
      {
        key    : 'type',
        type   : 'select',
        options: [
          { label: 'Cliente',  value: 'CLIENT'   },
          { label: 'Externo',  value: 'EXTERNAL' },
        ],
      },
    ] as EditField<Record<string, unknown>>[],
  };

  ngOnInit(): void {}

  /* ---- CREATE ---- */
  openCreate(): void {
    this.createForm.reset({ type: 'CLIENT' });
    this.createError.set('');
    this.createModalOpen.set(true);
  }

  closeCreate(): void {
    this.createModalOpen.set(false);
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.createLoading.set(true);
    this.createError.set('');

    const payload: CompanyPayload = {
      rfc        : this.createForm.value.rfc,
      legalName  : this.createForm.value.legalName,
      zipCode    : this.createForm.value.zipCode,
      nickname   : this.createForm.value.nickname || null,
      taxRegimeId: this.createForm.value.taxRegimeId || null,
      type       : this.createForm.value.type,
    };

    this.svc.create(payload).subscribe({
      next: () => {
        this.createLoading.set(false);
        this.closeCreate();
        this.tableRef()?.refresh();
      },
      error: (err) => {
        this.createLoading.set(false);
        this.createError.set(err?.error?.message ?? 'Error al crear la empresa.');
      }
    });
  }

  /* ---- INLINE EDIT SAVE ---- */
  handleEdit(row: Record<string, unknown>): void {
    const id = Number(row['id']);
    const payload: Partial<CompanyPayload> = {
      rfc        : String(row['rfc'] ?? ''),
      legalName  : String(row['legalName'] ?? ''),
      zipCode    : String(row['zipCode'] ?? ''),
      nickname   : row['nickname'] ? String(row['nickname']) : null,
      taxRegimeId: row['taxRegimeId'] ? String(row['taxRegimeId']) : null,
      type       : row['type'] as 'CLIENT' | 'EXTERNAL',
    };

    this.svc.update(id, payload).subscribe({
      next: () => this.tableRef()?.refresh(),
      error: (err) => console.error('Error al actualizar:', err)
    });
  }

  /* ---- DELETE ---- */
  handleDelete(id: unknown): void {
    this.svc.remove(Number(id)).subscribe({
      next: () => this.tableRef()?.refresh(),
      error: (err) => console.error('Error al eliminar:', err)
    });
  }
}
