import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { Product } from '../../../../shared/types/product.interface';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    RouterModule
  ],
  template: `
    <mat-card class="product-card">
      <div class="card-image-container">
        <img 
          mat-card-image 
          [src]="product.image_url" 
          [alt]="product.name"
          class="product-image"
          (error)="onImageError($event)">
      </div>
      
      <mat-card-header>
        <mat-card-title class="product-title">{{ product.name }}</mat-card-title>
        <mat-card-subtitle class="product-price">{{'$' + product.price }}</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <p class="product-description">{{ product.description }}</p>
        <mat-chip-set>
          <mat-chip [class]="'status-' + product.status">
            {{ product.status | titlecase }}
          </mat-chip>
        </mat-chip-set>
      </mat-card-content>
      
      <mat-card-actions>
        <button 
          mat-raised-button 
          color="primary"
          (click)="onAddToCart()">
          <mat-icon>shopping_cart</mat-icon>
          Agregar
        </button>
        <button 
          mat-button 
          [routerLink]="['/products', product.id]">
          <mat-icon>visibility</mat-icon>
          Ver Detalle
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .product-card {
      max-width: 350px;
      margin: 0 auto;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }
    
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
    }
    
    .card-image-container {
      width: 100%;
      height: 200px;
      overflow: hidden;
    }
    
    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .product-title {
      font-size: 1.1rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    
    .product-price {
      color: #4caf50;
      font-weight: 600;
      font-size: 1.2rem;
    }
    
    .product-description {
      color: rgba(0,0,0,0.6);
      line-height: 1.4;
      margin: 1rem 0;
    }
    
    .status-active {
      background-color: #4caf50;
      color: white;
    }
    
    .status-inactive {
      background-color: #ff9800;
      color: white;
    }
    
    mat-card-actions {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() productClick = new EventEmitter<Product>();

  onAddToCart() {
    console.log('Agregar al carrito:', this.product);
    // TODO: Implementar lógica de carrito
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/400x300/cccccc/666666?text=Imagen+no+disponible';
  }
}