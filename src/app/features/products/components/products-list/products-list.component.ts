import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../../../shared/types/product.interface';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    ProductCardComponent
  ],
  template: `
    <div class="container">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Cargando productos desde el servidor...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <h3>Problema de conexión</h3>
          <p>{{ error() }}</p>
          <button (click)="loadProducts()" class="retry-button">
            <mat-icon>refresh</mat-icon>
            Reintentar conexión
          </button>
        </div>
      } @else {
        <div class="success-indicator">
          <mat-icon color="primary">check_circle</mat-icon>
          <span>Conectado al servidor - {{ products().length }} productos cargados</span>
        </div>
        
        <div class="products-grid">
          @for (product of products(); track product.id) {
            <app-product-card 
              [product]="product"
              (productClick)="onProductClick($event)">
            </app-product-card>
          } @empty {
            <div class="empty-state">
              <mat-icon>inventory_2</mat-icon>
              <h3>No hay productos disponibles</h3>
              <p>El servidor está conectado pero no hay productos en la base de datos</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
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
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
      justify-items: center;
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
      margin: 1rem;
      border: 2px solid #ffcdd2;
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      text-align: center;
      color: #666;
      grid-column: 1 / -1;
    }
    
    .empty-state mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
    }
    
    .retry-button {
      background-color: #f44336;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      transition: background-color 0.2s;
    }
    
    .retry-button:hover {
      background-color: #d32f2f;
    }
  `]
})
export class ProductsListComponent implements OnInit, OnDestroy {
  private productsService = inject(ProductsService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();
  
  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set(null);

    this.productsService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.loading.set(false);
          
          console.log('✅ Productos cargados desde API:', products);
          
          this.snackBar.open(
            `✅ ${products.length} productos cargados desde el servidor`, 
            'Cerrar', 
            {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            }
          );
        },
        error: (err) => {
          this.error.set('No se pudo conectar al servidor en localhost:8000 ...');
          this.loading.set(false);
          
          console.error('❌ Error conectando con API:', err);
          
          this.snackBar.open(
            '❌ Error de conexión con el servidor', 
            'Cerrar', 
            {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            }
          );
        }
      });
  }

  onProductClick(product: Product) {
    console.log('Product clicked:', product);
  }
}