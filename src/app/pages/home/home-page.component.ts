import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

interface HeroMetric {
  label: string;
  value: string;
  helper: string;
  trend?: 'up' | 'down' | 'flat';
  delta?: string;
}

interface CommandAction {
  label: string;
  description: string;
  icon: string;
  emphasis?: 'primary' | 'default';
}

interface SignalInsight {
  title: string;
  detail: string;
  meta: string;
  status: 'good' | 'warning' | 'danger';
  icon: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  private readonly auth = inject(AuthService);
  protected readonly user$ = this.auth.user$;
  protected readonly heroMetrics: HeroMetric[] = [
    {
      label: 'Active restaurants',
      value: '12',
      helper: '2 onboarding in EMEA',
      trend: 'up',
      delta: '+2 this week'
    },
    {
      label: 'Open tables',
      value: '148',
      helper: 'Capacity across all floors',
      trend: 'flat',
      delta: '86% utilisation'
    },
    {
      label: 'Orders in flight',
      value: '37',
      helper: 'Processing + ready states',
      trend: 'down',
      delta: '-6 vs last hour'
    },
    {
      label: 'Customer satisfaction',
      value: '4.8',
      helper: 'Rolling 7 day csat',
      trend: 'up',
      delta: '+0.2 trend'
    }
  ];
  protected readonly commandActions: CommandAction[] = [
    { label: 'Provision seating', description: 'Add tables & sections', icon: 'view_week', emphasis: 'primary' },
    { label: 'Open new location', description: 'Spin up restaurant shell', icon: 'location_city' },
    { label: 'Sync menu catalog', description: 'Push latest menu items', icon: 'cloud_sync' },
    { label: 'Broadcast status', description: 'Notify staff & FOH', icon: 'campaign' }
  ];
  protected readonly signalInsights: SignalInsight[] = [
    { title: 'Platform health', detail: 'All services operational', meta: 'Live sync 2 min ago', status: 'good', icon: 'verified' },
    { title: 'Data lake ingest', detail: 'SLA at 97%', meta: 'West Europe cluster', status: 'warning', icon: 'sync_problem' },
    { title: 'Customer escalations', detail: '1 priority item queued', meta: 'Response avg 4m', status: 'danger', icon: 'report' }
  ];

  protected login(): void {
    this.auth.login().catch((error) => console.error('Login failed', error));
  }

  protected logout(): void {
    this.auth.logout();
  }
}
