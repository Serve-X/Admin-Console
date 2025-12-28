import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavMenuComponent, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly auth = inject(AuthService);
  protected readonly user$ = this.auth.user$;
  protected readonly environmentChip = {
    label: 'Prod West Europe',
    detail: 'Auto-patch enabled',
    status: 'good' as const
  };

  protected login(): void {
    this.auth.login().catch((error) => console.error('Login failed', error));
  }

  protected logout(): void {
    this.auth.logout();
  }
}
