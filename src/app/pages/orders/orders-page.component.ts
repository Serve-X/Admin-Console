import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../services/api.service';
import { OrderDto, OrderStatus, StatusMessage } from '../../models/api-models';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.css'
})
export class OrdersPageComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected orders: OrderDto[] = [];
  protected selectedOrder?: OrderDto;
  protected status?: StatusMessage;
  protected readonly statusOptions: OrderStatus[] = ['PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'REJECTED'];

  protected readonly statusForm = this.fb.group({
    orderId: ['', Validators.required],
    status: ['PENDING' as OrderStatus, Validators.required]
  });

  protected readonly createForm = this.fb.group({
    tableNumber: [null as number | null, Validators.required],
    status: ['PENDING' as OrderStatus, Validators.required]
  });

  constructor() {
    this.loadOrders();
  }

  protected loadOrders(): void {
    this.api
      .getOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (orders) => (this.orders = orders),
        error: () => this.setStatus('error', 'Unable to load orders')
      });
  }

  protected selectOrder(order: OrderDto): void {
    this.selectedOrder = order;
    this.statusForm.patchValue({
      orderId: order.orderId ?? '',
      status: (order.status as OrderStatus) ?? 'PENDING'
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
    this.api.updateOrder(orderId, { status }).subscribe({
      next: (updated) => {
        this.setStatus('success', `Order ${orderId} moved to ${status}`);
        this.selectedOrder = updated;
        this.loadOrders();
      },
      error: () => this.setStatus('error', 'Unable to update order status')
    });
  }

  protected deleteOrder(order: OrderDto): void {
    if (!order.orderId) {
      return;
    }
    this.api.deleteOrder(order.orderId).subscribe({
      next: () => {
        this.setStatus('success', 'Order deleted');
        this.loadOrders();
        if (this.selectedOrder?.orderId === order.orderId) {
          this.selectedOrder = undefined;
          this.statusForm.reset();
        }
      },
      error: () => this.setStatus('error', 'Unable to delete order')
    });
  }

  protected createOrder(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const { tableNumber, status } = this.createForm.getRawValue();
    const payload: OrderDto = {
      tableNumber: tableNumber ?? undefined,
      status: status ?? 'PENDING'
    };
    this.api.createOrder(payload).subscribe({
      next: (order) => {
        this.setStatus('success', `Order ${order.orderId ?? ''} created`);
        this.createForm.reset({ status: 'PENDING' });
        this.loadOrders();
      },
      error: () => this.setStatus('error', 'Unable to create order')
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

  private setStatus(type: StatusMessage['type'], message: string): void {
    this.status = { type, message };
  }
}
