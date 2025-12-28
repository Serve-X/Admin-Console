import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface NavLink {
  label: string;
  path: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  protected readonly navLinks: NavLink[] = [
    { label: 'Home', path: '/home', icon: 'home', description: 'Operations workspace' },
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard', description: 'Signals & telemetry' },
    { label: 'Tables', path: '/tables', icon: 'table_restaurant', description: 'Floor capacity orchestration' },
    { label: 'Restaurants', path: '/restaurants', icon: 'storefront', description: 'Location lifecycle' },
    { label: 'Orders', path: '/orders', icon: 'receipt_long', description: 'Kitchen workload routing' },
    { label: 'Items', path: '/items', icon: 'fastfood', description: 'Menu catalogue' },
    { label: 'Customers', path: '/customers', icon: 'people', description: 'Directory & profiles' },
    { label: 'Reviews', path: '/reviews', icon: 'rate_review', description: 'Guest sentiment tracker' },
    { label: 'UI Orders', path: '/ui-orders', icon: 'web', description: 'Guest UI simulator' }
  ];
}
