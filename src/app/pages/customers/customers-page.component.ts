import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../services/api.service';
import { CustomerDto, StatusMessage } from '../../models/api-models';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customers-page.component.html',
  styleUrl: './customers-page.component.css'
})
export class CustomersPageComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected customers: CustomerDto[] = [];
  protected status?: StatusMessage;
  protected readonly form = this.fb.group({
    customerID: [''],
    customerName: ['', Validators.required],
    customerEmail: ['', [Validators.required, Validators.email]],
    customerPhone: ['', Validators.required]
  });

  constructor() {
    this.loadCustomers();
  }

  protected loadCustomers(): void {
    this.api
      .getCustomers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (customers) => (this.customers = customers),
        error: () => this.setStatus('error', 'Unable to fetch customers')
      });
  }

  protected selectCustomer(customer: CustomerDto): void {
    this.form.patchValue({
      customerID: customer.customerID ?? '',
      customerName: customer.customerName ?? '',
      customerEmail: customer.customerEmail ?? '',
      customerPhone: customer.customerPhone ?? ''
    });
  }

  protected resetForm(): void {
    this.form.reset();
    this.status = undefined;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { customerID, customerName, customerEmail, customerPhone } = this.form.getRawValue();
    const payload: CustomerDto = {
      customerName: customerName ?? undefined,
      customerEmail: customerEmail ?? undefined,
      customerPhone: customerPhone ?? undefined
    };

    const request = customerID ? this.api.updateCustomer(customerID, payload) : this.api.createCustomer(payload);

    request.subscribe({
      next: () => {
        this.setStatus('success', customerID ? 'Customer updated' : 'Customer created');
        this.loadCustomers();
        if (!customerID) {
          this.resetForm();
        }
      },
      error: () => this.setStatus('error', 'Failed to save customer')
    });
  }

  protected deleteCustomer(customer: CustomerDto): void {
    if (!customer.customerID) {
      return;
    }
    this.api.deleteCustomer(customer.customerID).subscribe({
      next: () => {
        this.setStatus('success', 'Customer deleted');
        this.loadCustomers();
      },
      error: () => this.setStatus('error', 'Unable to delete customer')
    });
  }

  private setStatus(type: StatusMessage['type'], message: string): void {
    this.status = { type, message };
  }
}
