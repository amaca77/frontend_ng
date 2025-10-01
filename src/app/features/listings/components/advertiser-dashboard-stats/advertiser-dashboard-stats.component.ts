import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MyListingsService, DashboardStats } from '../../services/my-listings.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-advertiser-dashboard-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,     
    MatTooltipModule 
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
  refreshing = signal<boolean>(false);

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(forceRefresh: boolean = false): void {
    if (forceRefresh) {
      this.refreshing.set(true);
    } else {
      this.loading.set(true);
    } 
    
    this.error.set(null);
    
    this.myListingsService.getDashboardStats(forceRefresh).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
        this.refreshing.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar estadísticas');
        this.loading.set(false);
        this.refreshing.set(false);
        console.error('Error loading stats:', err);
      }
    });
  }

  refresh(): void {
    this.loadStats(true);
  }
}