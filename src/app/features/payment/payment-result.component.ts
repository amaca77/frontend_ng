import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="payment-result-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon [color]="getStatusColor()">{{ getStatusIcon() }}</mat-icon>
            Resultado del Pago
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <!-- Resumen del estado -->
          <div class="payment-status" [class]="getStatusClass()">
            <h2>{{ getStatusMessage() }}</h2>
            <p>{{ getStatusDescription() }}</p>
          </div>

          <!-- Mostrar todos los parámetros recibidos -->
          <div class="parameters-section">
            <h3>Detalles de la Transacción</h3>
            
            @if (paymentParams().size > 0) {
              <div class="parameters-grid">
                @for (param of getParametersArray(); track param.key) {
                  <div class="parameter-item">
                    <strong>{{ formatParameterName(param.key) }}:</strong>
                    <span>{{ param.value }}</span>
                  </div>
                }
              </div>
            } @else {
              <p>No se recibieron parámetros del medio de pago.</p>
            }
          </div>

          <!-- Datos JSON para desarrollo -->
          <details class="debug-section">
            <summary>Ver datos técnicos (debug)</summary>
            <pre>{{ getParametersJson() }}</pre>
          </details>
        </mat-card-content>

        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="goToOrders()">
            Ver mis pedidos
          </button>
          <button mat-button (click)="goHome()">
            Ir al inicio
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .payment-result-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
    }

    .payment-status {
      text-align: center;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .payment-status.success {
      background-color: #e8f5e8;
      color: #2e7d32;
      border: 2px solid #4caf50;
    }

    .payment-status.error {
      background-color: #ffebee;
      color: #c62828;
      border: 2px solid #f44336;
    }

    .payment-status.pending {
      background-color: #fff3e0;
      color: #ef6c00;
      border: 2px solid #ff9800;
    }

    .parameters-section {
      margin: 2rem 0;
    }

    .parameters-grid {
      display: grid;
      gap: 1rem;
      margin-top: 1rem;
    }

    .parameter-item {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 1rem;
      padding: 0.5rem;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .debug-section {
      margin-top: 2rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 1rem;
    }

    .debug-section pre {
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }

    mat-card-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
  `]
})
export class PaymentResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  paymentParams = signal(new Map<string, string>());

  ngOnInit() {
    // Obtener todos los query parameters
    this.route.queryParams.subscribe(params => {
      const paramMap = new Map<string, string>();
      
      Object.keys(params).forEach(key => {
        paramMap.set(key, params[key]);
      });
      
      this.paymentParams.set(paramMap);
      
      console.log('💳 Payment result parameters:', params);
    });
  }

  getParametersArray() {
    return Array.from(this.paymentParams().entries()).map(([key, value]) => ({
      key,
      value
    }));
  }

  getParametersJson(): string {
    const obj = Object.fromEntries(this.paymentParams());
    return JSON.stringify(obj, null, 2);
  }

  formatParameterName(key: string): string {
    // Formatear nombres de parámetros para mostrar
    const translations: { [key: string]: string } = {
      'status': 'Estado',
      'transaction_id': 'ID de Transacción',
      'external_transaction_id': 'ID Externo',
      'amount': 'Monto',
      'currency': 'Moneda',
      'payment_method': 'Método de Pago',
      'order_id': 'ID de Pedido'
    };
    
    return translations[key] || key.replace(/_/g, ' ').toUpperCase();
  }

  getStatusMessage(): string {
    const status = this.paymentParams().get('status');
    
    switch (status) {
      case 'approved':
        return '¡Pago Exitoso!';
      case 'rejected':
        return 'Pago Rechazado';
      case 'pending':
        return 'Pago Pendiente';
      default:
        return 'Estado Desconocido';
    }
  }

  getStatusDescription(): string {
    const status = this.paymentParams().get('status');
    
    switch (status) {
      case 'approved':
        return 'Tu pago se procesó correctamente. En breve recibirás la confirmación por email.';
      case 'rejected':
        return 'El pago no pudo ser procesado. Intenta nuevamente o usa otro método de pago.';
      case 'pending':
        return 'Tu pago está siendo procesado. Te notificaremos cuando esté confirmado.';
      default:
        return 'Recibimos información del medio de pago.';
    }
  }

  getStatusIcon(): string {
    const status = this.paymentParams().get('status');
    
    switch (status) {
      case 'approved':
        return 'check_circle';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'schedule';
      default:
        return 'info';
    }
  }

  getStatusColor(): string {
    const status = this.paymentParams().get('status');
    
    switch (status) {
      case 'approved':
        return 'primary';
      case 'rejected':
        return 'warn';
      default:
        return '';
    }
  }

  getStatusClass(): string {
    const status = this.paymentParams().get('status');
    
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'pending';
      default:
        return 'pending';
    }
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}