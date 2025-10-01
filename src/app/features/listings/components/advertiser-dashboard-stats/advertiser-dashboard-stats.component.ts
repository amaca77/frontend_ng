import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MyListingsService, DashboardStats } from '../../services/my-listings.service';

@Component({
  selector: 'app-advertiser-dashboard-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './advertiser-dashboard-stats.component.html',
  styleUrl: './advertiser-dashboard-stats.component.scss'
})
export class AdvertiserDashboardStatsComponent implements OnInit {
  private myListingsService = inject(MyListingsService);
  
  // Signals para estado reactivo
  stats = signal<DashboardStats | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.myListingsService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar estadísticas');
        this.loading.set(false);
        console.error('Error loading stats:', err);
      }
    });
  }

  refresh(): void {
    this.loadStats();
  }
}