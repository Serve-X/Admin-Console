import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `<section class="card"><h2>Signing you in…</h2><p>Please wait while we complete authentication.</p></section>`
})
export class AuthCallbackComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    this.route.queryParamMap.subscribe(async (params) => {
      const code = params.get('code');
      const state = params.get('state');
      if (!code || !state) {
        await this.router.navigateByUrl('/auth/error');
        return;
      }
      try {
        await this.auth.handleAuthCallback(code, state);
        const redirect = this.auth.consumeRedirectPath();
        await this.router.navigateByUrl(redirect);
      } catch (err) {
        console.error('Auth callback failed', err);
        if (err instanceof HttpErrorResponse) {
          console.error('Token endpoint payload:', err.error);
        }
        await this.router.navigateByUrl('/auth/error');
      }
    });
  }
}
