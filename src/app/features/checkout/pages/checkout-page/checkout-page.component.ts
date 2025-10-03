// src/app/features/checkout/pages/checkout-page/checkout-page.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from '../../../../core/services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; 
// En las importaciones del checkout-page.component.ts, agregar:
import { Cart, CheckoutValidation, CheckoutCalculation } from '../../../../shared/types/cart.interface';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,        
    MatFormFieldModule,    
    FormsModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatSelectModule
         
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

                    <div class="quantity-section">
                      <mat-form-field appearance="outline" class="quantity-field">
                        <mat-label>Cantidad</mat-label>
                        <input 
                          matInput 
                          type="number" 
                          min="1" 
                          max="99"
                          [value]="item.quantity"
                          (blur)="updateQuantity(item.listing_id, $event)"
                          (keyup.enter)="updateQuantity(item.listing_id, $event)">
                      </mat-form-field>
                    </div>

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
                  <span>$ {{ getSubTotalPrice() | number:'1.2-2' }}</span>
                </div>

              <!-- Métodos de envío -->
              <div class="shipping-methods">
                <h4>Método de entrega:</h4>
                @if (cart()?.items && cart()!.items.length > 0) {
                  @for (method of cart()!.items[0].productData.delivery_methods; track method.id) {
                    <mat-radio-button 
                      [value]="method.id" 
                      (change)="onShippingMethodChange(method.id)">
                      {{ method.name }} - $ {{ method.cost }} 
                      <small>{{ method.description }}</small>
                    </mat-radio-button>
                  }
                }
              </div>

                <div class="total-line total-final">
                  <span><strong>Total:</strong></span>
                  <span><strong>$ {{ totals()?.total | number:'1.2-2' }}</strong></span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
          
          <!-- Formulario de checkout (próximo paso) -->
          <mat-card class="checkout-form">
            <mat-card-header>
              <mat-card-title>Datos de la compra</mat-card-title>
            </mat-card-header>
            
          <mat-card-content>
            <form [formGroup]="checkoutForm" class="checkout-form-grid">
              
              <!-- Datos del cliente -->
              <mat-form-field appearance="outline">
                <mat-label>Nombre completo</mat-label>
                <input matInput formControlName="delivery_name">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="customer_email" readonly>
              </mat-form-field>

               
                <mat-form-field appearance="outline" class="identification-type">
                  <mat-label>Tipo de documento</mat-label>
                  <mat-select formControlName="customer_identification_type" required>
                    <mat-option value="DNI_ARG">DNI</mat-option>
                    <mat-option value="CUIT_ARG">CUIT/CUIL</mat-option>
                  </mat-select>
                  <mat-error>Seleccione tipo de documento</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="identification-number">
                  <mat-label>Número de documento</mat-label>
                  <input matInput 
                         formControlName="customer_identification_number" 
                         placeholder="Ej: 12.345.678 o 20-12345678-9"
                         required>
                  <mat-error>El número de documento es requerido</mat-error>
                </mat-form-field>
              
              
              <mat-form-field appearance="outline">
                <mat-label>Teléfono</mat-label>
                <input matInput formControlName="delivery_phone">
              </mat-form-field>

              <!-- Dirección de Facturación -->
              <h3 class="full-width" style="margin-top: 1.5rem; margin-bottom: 0.5rem;">Dirección de Facturación</h3>

              <mat-form-field appearance="outline">
                <mat-label>Nombre completo</mat-label>
                <input matInput formControlName="billing_name" required>
                <mat-error>El nombre es requerido</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Teléfono</mat-label>
                <input matInput formControlName="billing_phone" required>
                <mat-error>El teléfono es requerido</mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Dirección de facturación</mat-label>
                <input matInput formControlName="billing_address" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Depto/Piso</mat-label>
                <input matInput formControlName="billing_apartment">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Código postal</mat-label>
                <input matInput formControlName="billing_postal_code" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Ciudad</mat-label>
                <input matInput formControlName="billing_city" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Provincia</mat-label>
                <input matInput formControlName="billing_province" required>
              </mat-form-field>


              <h3 class="full-width" style="margin-top: 1.5rem; margin-bottom: 0.5rem;">Dirección de Entrega</h3>
              <!-- Dirección de entrega -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Dirección de entrega</mat-label>
                <input matInput formControlName="delivery_address">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Depto/Piso</mat-label>
                <input matInput formControlName="delivery_apartment">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Código postal</mat-label>
                <input matInput formControlName="delivery_postal_code">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Ciudad</mat-label>
                <input matInput formControlName="delivery_city">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Provincia</mat-label>
                <input matInput formControlName="delivery_province">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notas adicionales</mat-label>
                <textarea matInput formControlName="delivery_notes" rows="3"></textarea>
              </mat-form-field>
              
            </form>
            
            <div class="action-buttons">
              <button mat-button (click)="goToProducts()">
                <mat-icon>arrow_back</mat-icon>
                Seguir Comprando
              </button>
              
              <button 
                mat-raised-button 
                color="primary" 
                (click)="proceedToPayment()"
                [disabled]="!canProceed() || !checkoutForm.valid">
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
    
    .validation-errors {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    
    .error-message {
      color: #856404;
      margin: 0.25rem 0;
    }
    
    .item-error {
      color: #d32f2f !important;
      font-size: 0.875rem;
      margin: 0.25rem 0;
    }
    
    .calculating {
      display: flex;
      align-items: center;
      gap: 1rem;
      justify-content: center;
      padding: 1rem;
    }
    
    .discount {
      color: #2e7d32;
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
    .checkout-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .full-width {
      grid-column: 1 / -1;
    }

  `]
})
export class CheckoutPageComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // Estados de validación - AGREGAR AL INICIO DE LA CLASE
  validating = signal(false);
  calculating = signal(false);
  validationErrors = signal<any[]>([]);
  totals = signal<CheckoutCalculation | null>(null);
  selectedShippingMethod = signal<string | null>(null);
    
  cart = this.cartService.cart;

  checkoutForm = this.fb.group({
    delivery_address: [''],
    delivery_apartment: [''],
    delivery_postal_code: [''],
    delivery_city: [''],
    delivery_province: [''],
    delivery_notes: [''],
    delivery_name: [''],
    customer_identification_type: ['DNI_ARG', Validators.required], // Default DNI
    customer_identification_number: ['', Validators.required],
    customer_email: [{value: '', disabled: true}],
    delivery_phone: [''],
    // Billing info (AGREGAR PRIMERO)
    billing_name: ['', Validators.required],        
    billing_phone: ['', Validators.required], 
    billing_address: ['', Validators.required],
    billing_apartment: [''],
    billing_postal_code: ['', Validators.required],
    billing_city: ['', Validators.required],
    billing_province: ['', Validators.required]
  });
  
  ngOnInit() {
    console.log('🛒 Checkout cargado, carrito:', this.cart());

    if (this.cart()) {
      this.validateCartWithBackend();
      this.calculateTotalsWithBackend();
    }

    const userEmail = this.authService.getUserInfo()?.email;
    if (userEmail) {
      this.checkoutForm.patchValue({ customer_email: userEmail });
    }
  }

  onShippingMethodChange(methodId: string) {
    console.log('🔄 Método de envío seleccionado:', methodId);
    this.selectedShippingMethod.set(methodId);
    this.calculateTotalsWithBackend();
  }

    /**
   * Actualizar cantidad de un item
   */
  updateQuantity(listing_id: string, event: any) {
    const newQuantity = parseInt(event.target.value);
    
    if (isNaN(newQuantity) || newQuantity < 1) {
      event.target.value = 1;
      return;
    }
    
    console.log(`🔄 Actualizando cantidad de ${listing_id} a ${newQuantity}`);
    
    // Actualizar en el carrito
    this.cartService.updateQuantity(listing_id, newQuantity);
    
    // Re-validar automáticamente después de 300ms
    setTimeout(() => {
      if (this.cart()) {
        this.validateCartWithBackend();
        this.calculateTotalsWithBackend();
      }
    }, 300);
  }

  
  removeItem(listing_id: string) {
    this.cartService.removeItem(listing_id);
  }
  
  getSubTotalPrice(): number {
    return this.cartService.getSubTotalPrice();
  }
  
  goToProducts() {
    this.router.navigate(['/products']);
  }
  
  proceedToPayment() {
    if (!this.canProceed() || !this.checkoutForm.valid) {
      this.snackBar.open('⚠️ Completa todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const cart = this.cart();
    if (!cart) {  // ← AGREGAR ESTA VERIFICACIÓN
      this.snackBar.open('❌ Error: carrito vacío', 'Cerrar', { duration: 3000 });
      return;
    }
    const formData = this.checkoutForm.value;
    
    const orderData = {
      items: this.checkoutService.cartItemsToBackendFormat(cart.items),
      delivery_method_id: this.selectedShippingMethod(),
      ...formData  // Todos los campos del formulario
    };
    
    console.log('💳 Creando orden:', orderData);
    
    this.checkoutService.createOrder(orderData).subscribe({
      next: (response) => {
        console.log('✅ Orden creada:', response);
        this.snackBar.open(`✅ Orden ${response.order_id} creada exitosamente`, 'Cerrar', { duration: 5000 });
        console.log('✅ form_url:', response.payment_url);
        window.location.href = response.payment_url;  // Redirigir a la URL de pago
      },
      error: (err) => {
        console.error('❌ Error creando orden:', err);
        this.snackBar.open('❌ Error al crear la orden', 'Cerrar', { duration: 3000 });
      }
    });
  }

  /**
 * Validar carrito con backend
 */
  validateCartWithBackend() {
    const cart = this.cart();
    if (!cart) return;
    
    this.validating.set(true);
    this.validationErrors.set([]);
    
    const request = {
      items: this.checkoutService.cartItemsToBackendFormat(cart.items),
      seller_id: cart.seller_id
    };
    
    this.checkoutService.validateCheckout(request).subscribe({
      next: (validation) => {
        this.validating.set(false);
        
        if (!validation.valid) {
          this.validationErrors.set(validation.errors);
          this.snackBar.open('⚠️ Se encontraron problemas en tu carrito', 'Cerrar', { duration: 4000 });
          console.log('❌ Carrito no válido');
        } else {
          console.log('✅ Carrito validado correctamente');
        }
      },
      error: (err) => {
        this.validating.set(false);
        console.error('❌ Error validando carrito:', err);
        this.snackBar.open('❌ Error validando productos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  /**
 * Calcular totales con backend
 */
  calculateTotalsWithBackend() {
    const cart = this.cart();
    if (!cart) return;
    
    this.calculating.set(true);
    
    const request = {
      items: this.checkoutService.cartItemsToBackendFormat(cart.items),
      seller_id: cart.seller_id,
      delivery_method_id: this.selectedShippingMethod() || 'pickup'
      // shipping_method: 'delivery' // Por ahora fijo, después dinámico
    };
    
    this.checkoutService.calculateTotals(request).subscribe({
      next: (totals) => {
        this.calculating.set(false);
        this.totals.set(totals);
        console.log('✅ Totales calculados:', totals);
      },
      error: (err) => {
        this.calculating.set(false);
        console.error('❌ Error calculando totales:', err);
        this.snackBar.open('❌ Error calculando totales', 'Cerrar', { duration: 3000 });
      }
    });
  }

  canProceed(): boolean {
    const cart = this.cart();
    return !this.validating() && 
          !this.calculating() && 
          this.validationErrors().length === 0 &&
          cart !== null &&
          cart.items.length > 0 &&
          this.selectedShippingMethod() !== null;
  }
}