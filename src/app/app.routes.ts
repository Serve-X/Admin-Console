import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TablesPageComponent } from './pages/tables/tables-page.component';
import { RestaurantsPageComponent } from './pages/restaurants/restaurants-page.component';
import { OrdersPageComponent } from './pages/orders/orders-page.component';
import { ItemsPageComponent } from './pages/items/items-page.component';
import { CustomersPageComponent } from './pages/customers/customers-page.component';
import { UiOrdersPageComponent } from './pages/ui-orders/ui-orders-page.component';
import { ReviewsPageComponent } from './pages/reviews/reviews-page.component';
import { authGuard } from './services/auth.guard';
import { AuthCallbackComponent } from './pages/auth/auth-callback.component';
import { AuthErrorComponent } from './pages/auth/auth-error.component';
import { HomePageComponent } from './pages/home/home-page.component';

const protectedRoutes: Routes = [
  { path: 'home', component: HomePageComponent, title: 'ServeX Admin Console', canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard', canActivate: [authGuard] },
  { path: 'tables', component: TablesPageComponent, title: 'Tables', canActivate: [authGuard] },
  { path: 'restaurants', component: RestaurantsPageComponent, title: 'Restaurants', canActivate: [authGuard] },
  { path: 'orders', component: OrdersPageComponent, title: 'Orders', canActivate: [authGuard] },
  { path: 'items', component: ItemsPageComponent, title: 'Items', canActivate: [authGuard] },
  { path: 'customers', component: CustomersPageComponent, title: 'Customers', canActivate: [authGuard] },
  { path: 'reviews', component: ReviewsPageComponent, title: 'Reviews', canActivate: [authGuard] },
  { path: 'ui-orders', component: UiOrdersPageComponent, title: 'UI Orders', canActivate: [authGuard] }
];

export const appRoutes: Routes = [
  ...protectedRoutes,
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'auth/error', component: AuthErrorComponent },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: '**', redirectTo: 'home' }
];
