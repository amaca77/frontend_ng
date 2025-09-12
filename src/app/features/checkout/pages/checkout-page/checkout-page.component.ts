// src/app/features/checkout/pages/checkout-page/checkout-page.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from '../../../../core/services/cart.service';
import { Cart } from '../../../../shared/types/cart.interface';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="checkout-container">
      <h1>🛒 Checkout</h1>
      
      @if (!cart()) {
        <div class="empty-cart">
          <mat-card>
            <mat-card-content>
              <div class="empty-content">
                <mat-icon class="empty-icon">shopping_cart</mat-icon>
                <h2>Carrito vacío</h2>
                <p>No tienes productos en el carrito para finalizar la compra.</p>
                <button mat-raised-button color="primary" (click)="goToProducts()">
                  Ver Productos
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      } @else {
        <div class="checkout-content">
          <!-- Resumen del carrito -->
          <mat-card class="cart-summary">
            <mat-card-header>
              <mat-card-title>Resumen de tu compra</mat-card-title>
            </mat-card-header>
            
            <mat-card-content>
              @for (item of cart()?.items; track item.listing_id) {
                <div class="cart-item">
                  <img [src]="item.productData.image_url" [alt]="item.productData.title" class="item-image">
                  <div class="item-details">
                    <h3>{{ item.productData.title }}</h3>
                    <p>Cantidad: {{ item.quantity }}</p>
                    <p class="item-price">$ {{ item.productData.price * item.quantity | number:'1.2-2' }}</p>
                  </div>
                  <button mat-icon-button (click)="removeItem(item.listing_id)" color="warn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
                <mat-divider></mat-divider>
              }
              
              <div class="cart-totals">
                <div class="total-line">
                  <span>Subtotal:</span>
                  <span>$ {{ getTotalPrice() | number:'1.2-2' }}</span>
                </div>
                <div class="total-line">
                  <span>Envío:</span>
                  <span>A calcular</span>
                </div>
                <div class="total-line total-final">
                  <span><strong>Total:</strong></span>
                  <span><strong>$ {{ getTotalPrice() | number:'1.2-2' }}</strong></span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
          
          <!-- Formulario de checkout (próximo paso) -->
          <mat-card class="checkout-form">
            <mat-card-header>
              <mat-card-title>Datos de entrega</mat-card-title>
            </mat-card-header>
            
            <mat-card-content>
              <p><em>Formulario de checkout - próxima implementación</em></p>
              
              <div class="action-buttons">
                <button mat-button (click)="goToProducts()">
                  <mat-icon>arrow_back</mat-icon>
                  Seguir Comprando
                </button>
                
                <button mat-raised-button color="primary" (click)="proceedToPayment()">
                  <mat-icon>payment</mat-icon>
                  Continuar al Pago
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    h1 {
      margin-bottom: 2rem;
      color: #333;
    }
    
    .empty-cart {
      display: flex;
      justify-content: center;
      margin-top: 4rem;
    }
    
    .empty-content {
      text-align: center;
      padding: 2rem;
    }
    
    .empty-icon {
      font-size: 4rem;
      height: 4rem;
      width: 4rem;
      color: #ccc;
      margin-bottom: 1rem;
    }
    
    .checkout-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    
    .cart-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
    }
    
    .item-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }
    
    .item-details {
      flex: 1;
    }
    
    .item-details h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
    }
    
    .item-details p {
      margin: 0.25rem 0;
      color: #666;
    }
    
    .item-price {
      font-weight: bold;
      color: #333 !important;
    }
    
    .cart-totals {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }
    
    .total-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    
    .total-final {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 2px solid #eee;
      font-size: 1.2rem;
    }
    
    .action-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
    }
    
    @media (max-width: 768px) {
      .checkout-content {
        grid-template-columns: 1fr;
      }
      
      .action-buttons {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class CheckoutPageComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);
  
  cart = this.cartService.cart;
  
  ngOnInit() {
    console.log('🛒 Checkout cargado, carrito:', this.cart());
  }
  
  removeItem(listing_id: string) {
    this.cartService.removeItem(listing_id);
  }
  
  getTotalPrice(): number {
    return this.cartService.getTotalPrice();
  }
  
  goToProducts() {
    this.router.navigate(['/products']);
  }
  
  proceedToPayment() {
    // Próxima implementación
    console.log('💳 Proceder al pago');
    alert('Funcionalidad de pago - próxima implementación');
  }
}