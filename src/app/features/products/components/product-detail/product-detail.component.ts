import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../../../shared/types/product.interface';
import { CartService } from '../../../../core/services/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
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
        
        <mat-card-content>
          <p class="product-description">
            {{ product()!.long_description || product()!.description }}
          </p>
          
          <div class="product-meta">
            <p><strong>Id Producto:</strong> {{ product()!.id }}</p>
            <p><strong>Precio:</strong> {{ product()!.price }}</p>
            <p><strong>Precio lista:</strong> {{ product()!.list_price }}</p>
            <p><strong>Stock:</strong> {{ product()!.stock }}</p>
            <p><strong>Máx. por pedido:</strong> {{ product()!.max_quantity }}</p>
            <p><strong>Categoría:</strong> {{ product()!.category }}</p>
            <p><strong>Vendedor:</strong> {{ product()!.advertiser }}</p>
          </div>

          <!-- Control de cantidad -->
                <div class="quantity-section">
                  <label class="quantity-label">Cantidad:</label>
                  <div class="quantity-controls">
                    <button 
                      mat-icon-button 
                      (click)="decreaseQuantity()"
                      [disabled]="selectedQuantity() <= 1">
                      <mat-icon>remove</mat-icon>
                    </button>
                    
                    <mat-form-field appearance="outline" class="quantity-input">
                      <input 
                        matInput 
                        type="number" 
                        [(ngModel)]="selectedQuantityValue"
                        [min]="1"
                        [max]="getMaxQuantity()"
                        (ngModelChange)="updateQuantity($event)">
                    </mat-form-field>
                    
                    <button 
                      mat-icon-button 
                      (click)="increaseQuantity()"
                      [disabled]="selectedQuantity() >= getMaxQuantity()">
                      <mat-icon>add</mat-icon>
                    </button>
                  </div>
                  <p class="quantity-info">Máximo: {{ getMaxQuantity() }} unidades</p>
                </div>
          
          <!-- Galería de imágenes si hay múltiples -->
@if (product()!.images && product()!.images!.length > 1) {
  <div class="image-gallery">
    @for (image of product()!.images!; track image.id) {
      <img [src]="image.url" [alt]="image.alt" class="gallery-image">
    }
  </div>
}
        </mat-card-content>
                      <mat-card-actions>
                <button 
                  mat-raised-button 
                  color="primary" 
                  class="buy-now-btn"
                  [disabled]="selectedQuantity() <= 0 || selectedQuantity() > getMaxQuantity()"
                  (click)="buyNow()">
                  <mat-icon>shopping_cart</mat-icon>
                  Comprar ({{ selectedQuantity() }})
                </button>

                <button 
                  mat-raised-button 
                  color="primary" 
                  class="addcart-now-btn"
                  [disabled]="selectedQuantity() <= 0 || selectedQuantity() > getMaxQuantity()"
                  (click)="addToCart()">
                  <mat-icon>shopping_cart</mat-icon>
                  Agregar al carrito ({{ selectedQuantity() }})
                </button>
                
                <button mat-outlined-button (click)="goBack()">
                  <mat-icon>arrow_back</mat-icon>
                  Volver a Productos
                </button>
              </mat-card-actions>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .gallery-image {
      width: 200px;
      height: 200px;  
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
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);

  product = signal<Product | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  productId: string | null = null;
  selectedQuantity = signal(1);
  selectedQuantityValue = 1;


  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
      
      if (id) {
        this.productId = id;
        this.loadProduct(this.productId);
      } else {
        this.error.set('ID de producto no válido');
      }
  } 

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProduct(id: string) {
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

  increaseQuantity() {
    const current = this.selectedQuantity();
    const max = this.getMaxQuantity();
    if (current < max) {
      this.selectedQuantity.set(current + 1);
      this.selectedQuantityValue = current + 1;
    }
  }

  decreaseQuantity() {
    const current = this.selectedQuantity();
    if (current > 1) {
      this.selectedQuantity.set(current - 1);
      this.selectedQuantityValue = current - 1;
    }
  }

  updateQuantity(value: number) {
    const max = this.getMaxQuantity();
    if (value >= 1 && value <= max) {
      this.selectedQuantity.set(value);
    } else if (value > max) {
      this.selectedQuantity.set(max);
      this.selectedQuantityValue = max;
    } else {
      this.selectedQuantity.set(1);
      this.selectedQuantityValue = 1;
    }
  }

  getMaxQuantity(): number {
    return this.product()?.max_quantity || 10;
  }

  addToCart() {
    const product = this.product();
    const quantity = this.selectedQuantity();

    if(product)
      console.log('🔍 Product delivery_methods antes de addItem:', product.delivery_methods);
    
    
    if (!product) {
      this.snackBar.open('❌ Error: Producto no disponible', 'Cerrar', { duration: 3000 });
      return;
    }

    console.log(`🛒 Agregando ${quantity} unidades de "${product.title}" al carrito`);
    
    const success = this.cartService.addItem(
      product.id,
      quantity,
      {
        title: product.title,
        price: product.price,
        image_url: product.image_url || product.image,
        delivery_methods: product.delivery_methods
      },
      product.advertiser_id ?? '' // Asumiendo que viene el seller_id del producto, fallback a string vacío
    );

    if (success) {
      this.snackBar.open(
        `✅ ${quantity} unidades agregadas al carrito`, 
        'Ver Carrito', 
        { 
          duration: 4000
        }
      ).onAction().subscribe(() => {
        // Opcional: navegar al carrito
        console.log('Ver carrito clicked');
      });
      
      // Reset cantidad después de agregar
      this.selectedQuantity.set(1);
      
    } else {
      this.snackBar.open(
        '❌ No se pueden mezclar productos de diferentes vendedores', 
        'Cerrar',
        { duration: 4000 }
      );
    }
  }

  /**
   * Comprar ahora (agregar al carrito + ir a checkout)
   */
  buyNow() {
    const product = this.product();
    const quantity = this.selectedQuantity();
    
    if (!product) {
      this.snackBar.open('❌ Error: Producto no disponible', 'Cerrar', { duration: 3000 });
      return;
    }

    console.log(`🛒 Compra directa: ${quantity} unidades de "${product.title}"`);
    
    // Limpiar carrito anterior para compra directa
    this.cartService.clearCart();
    
    const success = this.cartService.addItem(
      product.id,
      quantity,
      {
        title: product.title,
        price: product.price,
        image_url: product.image_url || product.image,
        delivery_methods: product.delivery_methods
      },
      product.advertiser_id ?? '' // seller_id, fallback a string vacío
    );

    if (success) {
      // Navegar inmediatamente al checkout
      this.router.navigate(['/checkout']);
    } else {
      this.snackBar.open('❌ Error agregando producto', 'Cerrar', { duration: 3000 });
    }
  }

  /**
   * Obtener info del carrito para mostrar
   */
  getCartInfo() {
    const totalItems = this.cartService.getTotalItems();
    const totalPrice = this.cartService.getSubTotalPrice();
    return { totalItems, totalPrice };
  }
  
}