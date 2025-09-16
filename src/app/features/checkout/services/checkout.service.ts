// src/app/features/checkout/services/checkout.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CartItem, CheckoutValidation, CheckoutCalculation } from '../../../shared/types/cart.interface';
import { map } from 'rxjs';

export interface CheckoutValidationRequest {
  items: { listing_id: string; quantity: number }[];
  seller_id: string;
  delivery_method_id?: string;
}

export interface CheckoutCalculationRequest {
  items: { listing_id: string; quantity: number }[];
  seller_id: string;
  shipping_address?: string;
  delivery_method_id?: string;
  discount_code?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private apiService = inject(ApiService);

  /**
   * Validar items del carrito con el backend
   */
  validateCheckout(request: CheckoutValidationRequest): Observable<CheckoutValidation> {
    console.log('🔍 Validando checkout:', request);
    
    return this.apiService.post<CheckoutValidation>('checkout/validate', request);
  }

  /**
   * Calcular totales del checkout
   */
  calculateTotals(request: CheckoutCalculationRequest): Observable<CheckoutCalculation> {
    return this.apiService.post<any>('checkout/calculate', request).pipe(
      map(response => ({
        subtotal: parseFloat(response.subtotal),     // ← CONVERTIR
        shipping: parseFloat(response.shipping),     // ← CONVERTIR  
        discounts: parseFloat(response.discounts),   // ← CONVERTIR
        taxes: parseFloat(response.taxes),           // ← CONVERTIR
        total: parseFloat(response.total),           // ← CONVERTIR
        errors: response.errors
      }))
    );
  }

  /**
   * Validación con debounce para tiempo real
   * Útil cuando el usuario cambia cantidades
   */
  validateWithDebounce(request: CheckoutValidationRequest, delay = 500): Observable<CheckoutValidation> {
    return new Observable(observer => {
      observer.next(request);
    }).pipe(
      debounceTime(delay),
      distinctUntilChanged(),
      switchMap(() => this.validateCheckout(request))
    );
  }

  /**
   * Cálculo con debounce para tiempo real
   */
  calculateWithDebounce(request: CheckoutCalculationRequest, delay = 500): Observable<CheckoutCalculation> {
    return new Observable(observer => {
      observer.next(request);
    }).pipe(
      debounceTime(delay),
      distinctUntilChanged(),
      switchMap(() => this.calculateTotals(request))
    );
  }

  /**
   * Helper: Convertir CartItem[] a formato del backend
   */
  cartItemsToBackendFormat(cartItems: CartItem[]) {
    return cartItems.map(item => ({
      listing_id: item.listing_id,
      quantity: item.quantity
    }));
  }

  /**
 * Crear orden completa
 */
  createOrder(orderData: any): Observable<any> {
    console.log('📦 Creando orden:', orderData);    
    return this.apiService.post<any>('checkout/create-order', orderData);
  }
}