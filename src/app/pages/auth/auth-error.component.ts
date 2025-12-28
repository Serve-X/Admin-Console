import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card">
      <h2>Authentication failed</h2>
      <p>We could not verify your identity. Please try signing in again.</p>
      <a href="/" class="retry">Return to login</a>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        margin-top: 2rem;
      }
      .retry {
        display: inline-block;
        margin-top: 1rem;
        font-weight: 600;
      }
    `
  ]
})
export class AuthErrorComponent {}
