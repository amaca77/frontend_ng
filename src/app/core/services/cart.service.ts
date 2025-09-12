// src/app/shared/services/cart.service.ts
import { Injectable, signal } from '@angular/core';
import { Cart, CartItem } from '../../shared/types/cart.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'jatic_cart';
  private readonly CART_EXPIRY_HOURS = 24;

  // Signal para reactivity
  private cartSignal = signal<Cart | null>(null);
  
  // Public readonly signal
  get cart() { 
    return this.cartSignal.asReadonly(); 
  }

  constructor() {
    // Cargar carrito al inicializar
    this.loadCart();
  }

  /**
   * Agregar item al carrito
   */
  addItem(listing_id: string, quantity: number, productData: any, seller_id: string): boolean {
    const currentCart = this.cartSignal();
    
    // Si hay carrito y es de otro vendedor, rechazar
    if (currentCart && currentCart.seller_id !== seller_id) {
      console.warn('❌ No se pueden mezclar productos de diferentes vendedores');
      return false;
    }
    
    // Crear nuevo carrito si no existe
    if (!currentCart) {
      const newCart: Cart = {
        seller_id,
        items: [{
          listing_id,
          quantity,
          productData: {
            title: productData.title,
            price: productData.price,
            image_url: productData.image_url || productData.image
          }
        }],
        created_at: new Date(),
        expires_at: this.getExpiryDate()
      };
      
      this.cartSignal.set(newCart);
      this.saveCart(newCart);
      console.log('✅ Producto agregado al carrito nuevo');
      return true;
    }
    
    // Verificar si ya existe el item
    const existingItemIndex = currentCart.items.findIndex(item => item.listing_id === listing_id);
    
    if (existingItemIndex >= 0) {
      // Actualizar cantidad
      currentCart.items[existingItemIndex].quantity += quantity;
    } else {
      // Agregar nuevo item
      currentCart.items.push({
        listing_id,
        quantity,
        productData: {
          title: productData.title,
          price: productData.price,
          image_url: productData.image_url || productData.image
        }
      });
    }
    
    this.cartSignal.set({...currentCart});
    this.saveCart(currentCart);
    console.log('✅ Producto agregado al carrito existente');
    return true;
  }

  /**
   * Remover item del carrito
   */
  removeItem(listing_id: string): void {
    const currentCart = this.cartSignal();
    if (!currentCart) return;
    
    const updatedItems = currentCart.items.filter(item => item.listing_id !== listing_id);
    
    if (updatedItems.length === 0) {
      // Si no quedan items, limpiar carrito
      this.clearCart();
    } else {
      const updatedCart = {...currentCart, items: updatedItems};
      this.cartSignal.set(updatedCart);
      this.saveCart(updatedCart);
    }
    
    console.log('✅ Item removido del carrito');
  }

  /**
   * Actualizar cantidad de un item
   */
  updateQuantity(listing_id: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(listing_id);
      return;
    }
    
    const currentCart = this.cartSignal();
    if (!currentCart) return;
    
    const itemIndex = currentCart.items.findIndex(item => item.listing_id === listing_id);
    if (itemIndex >= 0) {
      currentCart.items[itemIndex].quantity = quantity;
      this.cartSignal.set({...currentCart});
      this.saveCart(currentCart);
      console.log('✅ Cantidad actualizada');
    }
  }

  /**
   * Limpiar carrito completamente
   */
  clearCart(): void {
    this.cartSignal.set(null);
    localStorage.removeItem(this.CART_KEY);
    console.log('✅ Carrito limpiado');
  }

  /**
   * Obtener total de items
   */
  getTotalItems(): number {
    const cart = this.cartSignal();
    return cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
  }

  /**
   * Obtener total en pesos
   */
  getTotalPrice(): number {
    const cart = this.cartSignal();
    return cart ? cart.items.reduce((total, item) => 
      total + (item.quantity * item.productData.price), 0
    ) : 0;
  }

  // --- MÉTODOS PRIVADOS ---
  
  private loadCart(): void {
    try {
      const stored = localStorage.getItem(this.CART_KEY);
      if (!stored) return;
      
      const cart: Cart = JSON.parse(stored);
      cart.created_at = new Date(cart.created_at);
      cart.expires_at = new Date(cart.expires_at);
      
      // Verificar expiración
      if (new Date() > cart.expires_at) {
        console.log('🕐 Carrito expirado, removiendo');
        localStorage.removeItem(this.CART_KEY);
        return;
      }
      
      this.cartSignal.set(cart);
      console.log('✅ Carrito cargado desde localStorage');
      
    } catch (error) {
      console.error('❌ Error cargando carrito:', error);
      localStorage.removeItem(this.CART_KEY);
    }
  }
  
  private saveCart(cart: Cart): void {
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('❌ Error guardando carrito:', error);
    }
  }
  
  private getExpiryDate(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + this.CART_EXPIRY_HOURS);
    return expiry;
  }
}