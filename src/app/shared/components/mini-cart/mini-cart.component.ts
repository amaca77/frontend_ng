// src/app/shared/components/mini-cart/mini-cart.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-mini-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  template: `
    <button 
      mat-icon-button 
      (click)="goToCheckout()"
      [matTooltip]="getTooltipText()"
      matTooltipPosition="below"
      class="cart-button">
      
      <mat-icon 
        [matBadge]="getTotalItems()" 
        [matBadgeHidden]="getTotalItems() === 0"
        matBadgeColor="accent"
        matBadgeSize="small">
        shopping_cart
      </mat-icon>
    </button>
  `,
  styles: [`
    .cart-button {
      margin-left: 1rem;
    }
    
    .cart-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class MiniCartComponent {
  private cartService = inject(CartService);
  private router = inject(Router);
  
  getTotalItems(): number {
    return this.cartService.getTotalItems();
  }
  
  getSubTotalPrice(): number {
    return this.cartService.getSubTotalPrice();
  }
  
  getTooltipText(): string {
    const items = this.getTotalItems();
    const price = this.getSubTotalPrice();
    
    if (items === 0) {
      return 'Carrito vacío';
    }
    
    return `${items} productos - $ ${price.toFixed(2)}`;
  }
  
  goToCheckout() {
    if (this.getTotalItems() > 0) {
      this.router.navigate(['/checkout']);
    } else {
      // Opcional: mostrar mensaje o ir a productos
      this.router.navigate(['/products']);
    }
  }
}