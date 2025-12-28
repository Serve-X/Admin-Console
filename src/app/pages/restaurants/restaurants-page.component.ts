import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../services/api.service';
import { RestaurantDto, StatusMessage } from '../../models/api-models';

@Component({
  selector: 'app-restaurants-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './restaurants-page.component.html',
  styleUrl: './restaurants-page.component.css'
})
export class RestaurantsPageComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected restaurants: RestaurantDto[] = [];
  protected status?: StatusMessage;
  protected readonly form = this.fb.group({
    restaurantId: [''],
    restaurantName: ['', Validators.required],
    restaurantAddress: ['', Validators.required],
    isOpen: [true]
  });

  constructor() {
    this.loadRestaurants();
  }

  protected loadRestaurants(): void {
    this.api
      .getRestaurants()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (restaurants) => (this.restaurants = restaurants),
        error: () => this.setStatus('error', 'Unable to load restaurants')
      });
  }

  protected selectRestaurant(restaurant: RestaurantDto): void {
    this.form.patchValue({
      restaurantId: restaurant.restaurantId ?? '',
      restaurantName: restaurant.restaurantName ?? '',
      restaurantAddress: restaurant.restaurantAddress ?? '',
      isOpen: restaurant.isOpen ?? true
    });
  }

  protected resetForm(): void {
    this.form.reset({ isOpen: true });
    this.status = undefined;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { restaurantId, restaurantName, restaurantAddress, isOpen } = this.form.getRawValue();
    const payload: RestaurantDto = {
      restaurantName: restaurantName ?? undefined,
      restaurantAddress: restaurantAddress ?? undefined,
      isOpen: isOpen ?? undefined
    };

    const request = restaurantId
      ? this.api.updateRestaurant(restaurantId, payload)
      : this.api.createRestaurant(payload);

    request.subscribe({
      next: () => {
        this.setStatus('success', restaurantId ? 'Restaurant updated' : 'Restaurant created');
        this.loadRestaurants();
        if (!restaurantId) {
          this.resetForm();
        }
      },
      error: () => this.setStatus('error', 'Failed to save restaurant')
    });
  }

  protected deleteRestaurant(restaurant: RestaurantDto): void {
    if (!restaurant.restaurantId) {
      return;
    }
    this.api.deleteRestaurant(restaurant.restaurantId).subscribe({
      next: () => {
        this.setStatus('success', 'Restaurant deleted');
        this.loadRestaurants();
      },
      error: () => this.setStatus('error', 'Failed to delete restaurant')
    });
  }

  private setStatus(type: StatusMessage['type'], message: string): void {
    this.status = { type, message };
  }
}
