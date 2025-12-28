import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../services/api.service';
import { ReviewDto, StatusMessage } from '../../models/api-models';

@Component({
  selector: 'app-reviews-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews-page.component.html',
  styleUrl: './reviews-page.component.css'
})
export class ReviewsPageComponent {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected reviews: ReviewDto[] = [];
  protected status?: StatusMessage;

  constructor() {
    this.loadReviews();
  }

  protected loadReviews(): void {
    this.api
      .getReviews()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reviews) => (this.reviews = reviews),
        error: () => this.setStatus('error', 'Unable to load reviews')
      });
  }

  protected categoryClass(category?: string): string {
    switch (category) {
      case 'Good':
        return 'badge success';
      case 'Bad':
        return 'badge danger';
      case 'Complain':
        return 'badge warning';
      case 'Suggestions':
        return 'badge info';
      default:
        return 'badge';
    }
  }

  private setStatus(type: StatusMessage['type'], message: string): void {
    this.status = { type, message };
  }
}
