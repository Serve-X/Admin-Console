import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../services/api.service';
import { OrderDto, OrderStatus, TableDto } from '../../models/api-models';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

interface MetricCard {
  title: string;
  value: number | string;
  hint: string;
  link: string;
}

interface PieSegment {
  status: OrderStatus;
  count: number;
  percent: number;
  color: string;
  label: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  protected metrics: MetricCard[] = [];
  protected recentOrders: OrderDto[] = [];
  protected displayedColumns: string[] = ['orderId', 'status', 'table', 'customer', 'createdAt'];
  protected statusSegments: PieSegment[] = [];
  protected statusGradient = '';
  protected statusTotal = 0;
  private readonly statusOrder: OrderStatus[] = ['PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'REJECTED'];
  private readonly statusColors: Record<OrderStatus, string> = {
    PENDING: '#f7c948',
    PROCESSING: '#5c7cfa',
    READY: '#38d9a9',
    COMPLETED: '#22863a',
    REJECTED: '#ff6b6b'
  };

  constructor() {
    this.loadMetrics();
    this.loadRecentOrders();
  }

  private loadMetrics(): void {
    this.api
      .getTables()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tables) => this.updateTableMetric(tables));
    this.api
      .getRestaurants()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((restaurants) => {
      this.upsertMetric('Restaurants', restaurants.length, 'Active locations', '/restaurants');
    });
    this.api
      .getOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((orders) => {
        const open = orders.filter((order) => order.status && ['PENDING', 'PROCESSING', 'READY'].includes(order.status)).length;
        this.upsertMetric('Orders', orders.length, 'Total placed', '/orders');
        this.upsertMetric('Open Orders', open, 'Requiring attention', '/orders');
      });
  }

  private loadRecentOrders(): void {
    this.api
      .getOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((orders) => {
        const sorted = [...orders].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
        this.recentOrders = sorted.slice(0, 5);
        this.buildStatusSegments(orders);
      });
  }

  private updateTableMetric(tables: TableDto[]): void {
    const available = tables.filter((table) => table.available).length;
    const hint = `${available} / ${tables.length} available`;
    this.upsertMetric('Tables', tables.length, hint, '/tables');
  }

  protected statusColor(status?: OrderStatus): string {
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

  private upsertMetric(title: string, value: number, hint: string, link: string): void {
    const existing = this.metrics.find((metric) => metric.title === title);
    if (existing) {
      existing.value = value;
      existing.hint = hint;
      existing.link = link;
      return;
    }
    this.metrics = [...this.metrics, { title, value, hint, link }];
  }

  private buildStatusSegments(orders: OrderDto[]): void {
    if (!orders.length) {
      this.statusSegments = [];
      this.statusGradient = '';
      this.statusTotal = 0;
      return;
    }
    const total = orders.length;
    const segments: PieSegment[] = [];
    for (const status of this.statusOrder) {
      const count = orders.filter((order) => order.status === status).length;
      if (!count) {
        continue;
      }
      segments.push({
        status,
        count,
        percent: Math.round((count / total) * 1000) / 10,
        color: this.statusColors[status],
        label: status.toLowerCase()
      });
    }

    let cursor = 0;
    const slices: string[] = [];
    for (const segment of segments) {
      const degrees = (segment.count / total) * 360;
      const start = cursor;
      const end = start + degrees;
      slices.push(`${segment.color} ${start}deg ${end}deg`);
      cursor = end;
    }

    this.statusSegments = segments;
    this.statusGradient = `conic-gradient(${slices.join(', ')})`;
    this.statusTotal = total;
  }
}
