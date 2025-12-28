import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../services/api.service';
import { StatusMessage, TableDto } from '../../models/api-models';

@Component({
  selector: 'app-tables-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tables-page.component.html',
  styleUrl: './tables-page.component.css'
})
export class TablesPageComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected tables: TableDto[] = [];
  protected status?: StatusMessage;
  protected readonly form = this.fb.group({
    tableId: [''],
    tableNumber: [null as number | null, Validators.required],
    seatCount: [null as number | null, Validators.required],
    available: [true],
    restaurantId: ['']
  });

  constructor() {
    this.loadTables();
  }

  protected loadTables(): void {
    this.api
      .getTables()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tables) => (this.tables = tables),
        error: () => this.setStatus('error', 'Unable to fetch tables')
      });
  }

  protected selectTable(table: TableDto): void {
    this.form.patchValue({
      tableId: table.tableId ?? '',
      tableNumber: table.tableNumber ?? null,
      seatCount: table.seatCount ?? null,
      available: table.available ?? true,
      restaurantId: table.restaurant?.restaurantId ?? ''
    });
  }

  protected resetForm(): void {
    this.form.reset({ available: true });
    this.status = undefined;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { tableId, tableNumber, seatCount, available, restaurantId } = this.form.getRawValue();
    const payload: TableDto = {
      tableNumber: tableNumber ?? undefined,
      seatCount: seatCount ?? undefined,
      available: available ?? undefined,
      restaurant: restaurantId ? { restaurantId } : undefined
    };

    const request = tableId ? this.api.updateTable(tableId, payload) : this.api.createTable(payload);
    request.subscribe({
      next: () => {
        this.setStatus('success', tableId ? 'Table updated' : 'Table created');
        this.loadTables();
        if (!tableId) {
          this.resetForm();
        }
      },
      error: () => this.setStatus('error', 'Failed to save table')
    });
  }

  protected deleteTable(table: TableDto): void {
    if (!table.tableId) {
      return;
    }
    this.api.deleteTable(table.tableId).subscribe({
      next: () => {
        this.setStatus('success', 'Table deleted');
        this.loadTables();
      },
      error: () => this.setStatus('error', 'Failed to delete table')
    });
  }

  private setStatus(type: StatusMessage['type'], message: string): void {
    this.status = { type, message };
  }
}
