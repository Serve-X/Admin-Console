import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../services/api.service';
import { ItemDto, LineItem, OrderStatus, OrderView, PlaceOrderRequest, StatusMessage } from '../../models/api-models';

@Component({
  selector: 'app-ui-orders-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ui-orders-page.component.html',
  styleUrl: './ui-orders-page.component.css'
})
export class UiOrdersPageComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected orders: OrderView[] = [];
  protected menuItems: ItemDto[] = [];
  protected status?: StatusMessage;
  protected readonly statusOptions: OrderStatus[] = ['PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'REJECTED'];

  protected readonly filterForm = this.fb.group({
    tableNumber: [null as number | null]
  });

  protected readonly statusForm = this.fb.group({
    orderId: ['', Validators.required],
    status: ['PROCESSING' as OrderStatus, Validators.required]
  });

  protected readonly placeForm = this.fb.group({
    tableNumber: [null as number | null, Validators.required],
    customer: this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    }),
    items: this.fb.array([this.createItemGroup()])
  });

  constructor() {
    this.loadOrders();
    this.loadMenuItems();
  }

  protected get items(): FormArray {
    return this.placeForm.get('items') as FormArray;
  }

  protected addItem(): void {
    this.items.push(this.createItemGroup());
  }

  protected removeItem(index: number): void {
    if (this.items.length === 1) {
      return;
    }
    this.items.removeAt(index);
  }

  protected loadOrders(): void {
    const tableNumber = this.filterForm.value.tableNumber ?? undefined;
    this.api
      .getOrderViews(tableNumber ?? undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (orders) => (this.orders = orders),
        error: () => this.setStatus('error', 'Unable to load UI orders')
      });
  }

  protected applyFilter(): void {
    this.loadOrders();
  }

  private loadMenuItems(): void {
    this.api
      .getItems()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => (this.menuItems = items.filter((item) => item.isAvailable !== false)),
        error: () => this.setStatus('error', 'Unable to load menu items')
      });
  }

  protected placeOrder(): void {
    if (this.placeForm.invalid) {
      this.placeForm.markAllAsTouched();
      return;
    }
    const payload = this.buildPlaceOrderPayload();
    if (!payload.items.length) {
      this.setStatus('error', 'Add at least one item to the order');
      return;
    }
    this.api.placeOrder(payload).subscribe({
      next: (order) => {
        this.setStatus('success', `Order ${order.orderId ?? ''} placed`);
        this.resetPlaceForm();
        this.loadOrders();
      },
      error: () => this.setStatus('error', 'Unable to place order')
    });
  }

  protected updateStatus(): void {
    if (this.statusForm.invalid) {
      this.statusForm.markAllAsTouched();
      return;
    }
    const { orderId, status } = this.statusForm.getRawValue();
    if (!orderId || !status) {
      return;
    }
    this.api.updateOrderStatus(orderId, { status }).subscribe({
      next: () => {
        this.setStatus('success', `UI order ${orderId} updated`);
        this.loadOrders();
      },
      error: () => this.setStatus('error', 'Unable to update UI order')
    });
  }

  protected statusClass(status?: OrderStatus): string {
    switch (status) {
      case 'READY':
      case 'COMPLETED':
        return 'badge success';
      case 'PROCESSING':
        return 'badge info';
      case 'REJECTED':
        return 'badge danger';
      default:
        return 'badge warning';
    }
  }

  private createItemGroup() {
    return this.fb.group({
      itemId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  private buildPlaceOrderPayload(): PlaceOrderRequest {
    const { tableNumber, customer } = this.placeForm.getRawValue();
    const items: LineItem[] = this.items.controls
      .map((ctrl) => ctrl.value as LineItem)
      .filter((item) => item.itemId);
    return {
      tableNumber: tableNumber ?? undefined,
      customer: {
        name: customer?.name ?? '',
        email: customer?.email ?? '',
        phone: customer?.phone ?? ''
      },
      items
    };
  }

  private resetPlaceForm(): void {
    this.placeForm.reset({
      tableNumber: null,
      customer: { name: '', email: '', phone: '' }
    });
    this.items.clear();
    this.items.push(this.createItemGroup());
  }

  private setStatus(type: StatusMessage['type'], message: string): void {
    this.status = { type, message };
  }
}
