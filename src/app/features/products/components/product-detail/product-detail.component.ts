import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../../../shared/types/product.interface';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Cargando producto desde el servidor...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <h3>Producto no encontrado</h3>
          <p>{{ error() }}</p>
          <button mat-raised-button color="primary" (click)="retryLoad()">
            <mat-icon>refresh</mat-icon>
            Reintentar
          </button>
          <button mat-outlined-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Volver a productos
          </button>
        </div>
      } @else if (product()) {
        <div class="success-indicator">
          <mat-icon color="primary">check_circle</mat-icon>
          <span>Producto cargado desde el servidor</span>
        </div>
        
        <mat-card class="product-detail-card">
          <div class="product-content">
            <div class="product-image-section">
              <img 
                [src]="product()!.image_url" 
                [alt]="product()!.name"
                class="product-image"
                (error)="onImageError($event)">
            </div>
            
            <div class="product-info">
              <mat-card-header>
                <mat-card-title class="product-title">
                  {{ product()!.name }}
                </mat-card-title>
                <mat-card-subtitle class="product-price">
                  {{ '$'+product()!.price }}
                </mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <p class="product-description">
                  {{ product()!.description }}
                </p>
                
                <div class="product-meta">
                  <p><strong>Estado:</strong> {{ product()!.status | titlecase }}</p>
                  <p><strong>ID:</strong> {{ product()!.id }}</p>
                  <p><strong>Fecha de creación:</strong> {{ product()!.created_at | date:'medium' }}</p>
                </div>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-raised-button color="primary" class="add-to-cart-btn">
                  <mat-icon>shopping_cart</mat-icon>
                  Agregar al Carrito
                </button>
                <button mat-outlined-button (click)="goBack()">
                  <mat-icon>arrow_back</mat-icon>
                  Volver a Productos
                </button>
              </mat-card-actions>
            </div>
          </div>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .success-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: #e8f5e8;
      color: #2e7d32;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      font-weight: 500;
    }
    
    .product-detail-card {
      width: 100%;
    }
    
    .product-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      padding: 2rem;
    }
    
    .product-image {
      width: 100%;
      height: auto;
      max-height: 400px;
      object-fit: cover;
      border-radius: 8px;
    }
    
    .product-title {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .product-price {
      font-size: 1.5rem;
      color: #4caf50;
      font-weight: 600;
    }
    
    .product-description {
      font-size: 1.1rem;
      line-height: 1.6;
      margin: 1rem 0;
    }
    
    .product-meta p {
      margin: 0.5rem 0;
      color: rgba(0,0,0,0.7);
    }
    
    mat-card-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .add-to-cart-btn {
      flex: 1;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      text-align: center;
      color: #3f51b5;
    }
    
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      text-align: center;
      color: #f44336;
      background-color: #ffebee;
      border-radius: 8px;
      padding: 2rem;
      border: 2px solid #ffcdd2;
      gap: 1rem;
    }
    
    @media (max-width: 768px) {
      .product-content {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1rem;
      }
      
      .product-title {
        font-size: 1.5rem;
      }
      
      mat-card-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(ProductsService);
  private destroy$ = new Subject<void>();

  product = signal<Product | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  productId: number | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id && !isNaN(Number(id))) {
      this.productId = Number(id);
      this.loadProduct(this.productId);
    } else {
      this.error.set('ID de producto no válido');
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProduct(id: number) {
    this.loading.set(true);
    this.error.set(null);

    console.log('🔍 Cargando producto con ID:', id);

    this.productsService.getProduct(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          this.product.set(product);
          this.loading.set(false);
          console.log('✅ Producto cargado desde API:', product);
        },
        error: (err) => {
          this.error.set(`Producto con ID ${id} no encontrado en el servidor`);
          this.loading.set(false);
          console.error('❌ Error cargando producto:', err);
        }
      });
  }

  retryLoad() {
    if (this.productId) {
      this.loadProduct(this.productId);
    }
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/500x400/e0e0e0/757575?text=Imagen+no+disponible';
  }
}