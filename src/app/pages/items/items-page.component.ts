import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../services/api.service';
import { ItemDto, StatusMessage } from '../../models/api-models';

@Component({
  selector: 'app-items-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './items-page.component.html',
  styleUrl: './items-page.component.css'
})
export class ItemsPageComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected items: ItemDto[] = [];
  protected status?: StatusMessage;
  protected readonly form = this.fb.group({
    itemId: [''],
    itemName: ['', Validators.required],
    itemDescription: [''],
    itemPrice: ['', Validators.required],
    isAvailable: [true]
  });

  constructor() {
    this.loadItems();
  }

  protected loadItems(): void {
    this.api
      .getItems()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => (this.items = items),
        error: () => this.setStatus('error', 'Unable to load items')
      });
  }

  protected selectItem(item: ItemDto): void {
    this.form.patchValue({
      itemId: item.itemId ?? '',
      itemName: item.itemName ?? '',
      itemDescription: item.itemDescription ?? '',
      itemPrice: item.itemPrice ?? '',
      isAvailable: item.isAvailable ?? true
    });
  }

  protected resetForm(): void {
    this.form.reset({ isAvailable: true });
    this.status = undefined;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { itemId, itemName, itemDescription, itemPrice, isAvailable } = this.form.getRawValue();
    const payload: ItemDto = {
      itemName: itemName ?? undefined,
      itemDescription: itemDescription ?? undefined,
      itemPrice: itemPrice ?? undefined,
      isAvailable: isAvailable ?? undefined
    };

    const request = itemId ? this.api.updateItem(itemId, payload) : this.api.createItem(payload);

    request.subscribe({
      next: () => {
        this.setStatus('success', itemId ? 'Item updated' : 'Item created');
        this.loadItems();
        if (!itemId) {
          this.resetForm();
        }
      },
      error: () => this.setStatus('error', 'Failed to save item')
    });
  }

  protected deleteItem(item: ItemDto): void {
    if (!item.itemId) {
      return;
    }
    this.api.deleteItem(item.itemId).subscribe({
      next: () => {
        this.setStatus('success', 'Item deleted');
        this.loadItems();
      },
      error: () => this.setStatus('error', 'Unable to delete item')
    });
  }

  private setStatus(type: StatusMessage['type'], message: string): void {
    this.status = { type, message };
  }
}
