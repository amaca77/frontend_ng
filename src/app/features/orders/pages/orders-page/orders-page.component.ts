import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OrdersService } from '../../services/orders.service';


@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="orders-container">
      <h1>📋 Mis Compras</h1>
      
      @for (order of orders(); track order.id) {
        <mat-card class="order-card">
          <mat-card-header>
            <mat-card-title>Orden #{{ order.id.slice(-8) }}</mat-card-title>
            <mat-card-subtitle>{{ order.created_at | date:'short' }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p><strong>Estado: {{ order.status }}</strong></p>
            
            <p><strong>Total: $ {{ order.total }}</strong></p>
            @for (item of order.items; track item.listing_id) {
              <p>{{ item.listing_title }} x{{ item.quantity }}</p>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `
})
export class OrdersPageComponent implements OnInit {
  private ordersService = inject(OrdersService);
  orders = signal<any[]>([]);
  
  ngOnInit() {
    this.loadOrders();
  }
  
  loadOrders() {
    this.ordersService.getUserOrders().subscribe({
      next: (response) => this.orders.set(response.orders),
      error: (err) => console.error('Error loading orders:', err)
    });
  }
}