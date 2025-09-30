// src/app/features/listings/components/listing-card/listing-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MyListing } from '../../services/my-listings.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    RouterModule
  ],
  template: `
    <mat-card class="listing-card">
      <div class="card-image-container">
        <img 
          mat-card-image 
          [src]="getImageUrl()" 
          [alt]="listing.title"
          class="listing-image"
          (error)="onImageError($event)">
        
        <!-- Status badge -->
        <div class="status-badge" [class]="'status-' + listing.status">
          <mat-icon>{{ getStatusIcon() }}</mat-icon>
          {{ listing.status | titlecase }}
        </div>
      </div>
      
      <mat-card-header>
        <mat-card-title class="listing-title">{{ listing.title }}</mat-card-title>
        <mat-card-subtitle class="listing-price">
          <span class="current-price">\${{ listing.price.toFixed(2) }}</span>
          @if (listing.list_price && listing.list_price > listing.price) {
            <span class="list-price">\${{ listing.list_price.toFixed(2) }}</span>
          }
        </mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <p class="listing-description">{{ listing.description }}</p>
        
        <div class="listing-details">
          <div class="detail-item">
            <mat-icon>inventory</mat-icon>
            <span>Stock: {{ listing.stock }}</span>
          </div>
                  
          @if (listing.category) {
            <div class="detail-item">
              <mat-icon>category</mat-icon>
              <span>{{ listing.category }}</span>
            </div>
          }
          
          <div class="detail-item">
            <mat-icon>schedule</mat-icon>
            <span>{{ formatDate(listing.updated_at) }}</span>
          </div>
        </div>
      </mat-card-content>
      
      <mat-card-actions class="card-actions">
        <div class="primary-actions">
          <button 
            mat-raised-button 
            color="primary"
            (click)="onView()">
            <mat-icon>visibility</mat-icon>
            Ver
          </button>
          
          <button 
            mat-raised-button 
            (click)="onEdit()">
            <mat-icon>edit</mat-icon>
            Editar
          </button>
        </div>
        
        <div class="secondary-actions">
          <!-- Toggle Status -->
          <button 
            mat-icon-button 
            [title]="listing.status === 'active' ? 'Desactivar' : 'Activar'"
            (click)="onToggleStatus()"
            [color]="listing.status === 'active' ? 'warn' : 'primary'">
            <mat-icon>{{ listing.status === 'active' ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          
          <!-- Stock Update -->
          <button 
            mat-icon-button 
            title="Actualizar Stock"
            (click)="onUpdateStock()">
            <mat-icon>add_box</mat-icon>
          </button>
          
          <!-- More Options Menu -->
          <button mat-icon-button [matMenuTriggerFor]="moreMenu">
            <mat-icon>more_vert</mat-icon>
          </button>
          
          <mat-menu #moreMenu="matMenu">
            <button mat-menu-item (click)="onDuplicate()">
              <mat-icon>content_copy</mat-icon>
              <span>Duplicar</span>
            </button>
            
            <button mat-menu-item (click)="onViewStats()">
              <mat-icon>analytics</mat-icon>
              <span>Ver Estadísticas</span>
            </button>
            
            <mat-divider></mat-divider>
            
            <button mat-menu-item (click)="onDelete()" class="delete-action">
              <mat-icon>delete</mat-icon>
              <span>Eliminar</span>
            </button>
          </mat-menu>
        </div>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .listing-card {
      max-width: 350px;
      margin: 0 auto;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .listing-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }
    
    .card-image-container {
      position: relative;
      overflow: hidden;
    }
    
    .listing-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    .listing-card:hover .listing-image {
      transform: scale(1.05);
    }
    
    .status-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      backdrop-filter: blur(8px);
    }
    
    .status-active {
      background-color: rgba(76, 175, 80, 0.9);
      color: white;
    }
    
    .status-inactive {
      background-color: rgba(158, 158, 158, 0.9);
      color: white;
    }
    
    .status-draft {
      background-color: rgba(255, 193, 7, 0.9);
      color: black;
    }
    
    .listing-title {
      font-size: 1.1rem;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .listing-price {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }
    
    .current-price {
      font-size: 1.2rem;
      font-weight: bold;
      color: #2e7d32;
    }
    
    .list-price {
      font-size: 0.9rem;
      color: #666;
      text-decoration: line-through;
    }
    
    .listing-description {
      color: #666;
      font-size: 0.9rem;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      margin-bottom: 1rem;
    }
    
    .listing-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: #666;
    }
    
    .detail-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    mat-card-content {
      flex: 1;
    }
    
    .card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      margin-top: auto;
    }
    
    .primary-actions {
      display: flex;
      gap: 8px;
    }
    
    .secondary-actions {
      display: flex;
      align-items: center;
    }
    
    .delete-action {
      color: #f44336;
    }
    
    .delete-action mat-icon {
      color: #f44336;
    }
  `]
})
export class ListingCardComponent {
  @Input({ required: true }) listing!: MyListing;
  
  @Output() view = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() toggleStatus = new EventEmitter<{ id: string, active: boolean }>();
  @Output() updateStock = new EventEmitter<string>();
  @Output() duplicate = new EventEmitter<string>();
  @Output() viewStats = new EventEmitter<string>();

  getImageUrl(): string {
    if (this.listing.image_url) {
      // Si ya incluye el dominio completo
      if (this.listing.image_url.startsWith('http')) {
        return this.listing.image_url;
      }
      // Si es una ruta relativa, agregar el CDN
      return `https://cdn.jatic.com.ar${this.listing.image_url}`;
    }
    
    return 'assets/images/placeholder.jpg';
  }
  
  getStatusIcon(): string {
    switch (this.listing.status) {
      case 'active':
        return 'check_circle';
      case 'inactive':
        return 'visibility_off';
      default:
        return 'help';
    }
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit',
      year: '2-digit'
    });
  }
  
  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder.jpg';
  }
  
  // Event handlers
  onView(): void {
    this.view.emit(this.listing.id);
  }
  
  onEdit(): void {
    this.edit.emit(this.listing.id);
  }
  
  onDelete(): void {
    this.delete.emit(this.listing.id);
  }
  
  onToggleStatus(): void {
    const newStatus = this.listing.status === 'active' ? false : true;
    this.toggleStatus.emit({ id: this.listing.id, active: newStatus });
  }
  
  onUpdateStock(): void {
    const newStock = prompt('Nuevo stock:', this.listing.stock.toString());
    if (newStock && !isNaN(Number(newStock))) {
      this.updateStock.emit(this.listing.id);
    }
  }
  
  onDuplicate(): void {
    this.duplicate.emit(this.listing.id);
  }
  
  onViewStats(): void {
    this.viewStats.emit(this.listing.id);
  }
}