import { Routes } from '@angular/router';
import { AuthCallbackComponent } from './features/auth/pages/auth-callback/auth-callback.component';
import { PaymentResultComponent } from './features/payment/payment-result.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/products', 
    pathMatch: 'full' 
  },
  { 
    path: 'products', 
    loadComponent: () => import('./features/products/pages/products-page/products-page.component').then(c => c.ProductsPageComponent)
  },
  { 
    path: 'products/:id', 
    loadComponent: () => import('./features/products/pages/product-detail-page/product-detail-page.component').then(c => c.ProductDetailPageComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/pages/login-page/login-page.component').then(c => c.LoginPageComponent)
  },
  {
    path: 'auth/callback',
    component: AuthCallbackComponent
  },
  {
    path: 'checkout', 
    loadComponent: () => import('./features/checkout/pages/checkout-page/checkout-page.component').then(c => c.CheckoutPageComponent)
  },
  { 
    path: 'orders', 
    loadComponent: () => import('./features/orders/pages/orders-page/orders-page.component').then(c => c.OrdersPageComponent)
  },
  { 
    path: 'my-listings', 
    loadComponent: () => import('./features/listings/pages/my-listings-page/my-listings-page.component').then(c => c.MyListingsPageComponent)
  },
  {
    path: 'payment-result',
    component: PaymentResultComponent
  },
  {
    path: 'payment-error',
    component: PaymentResultComponent //PaymentErrorComponent
  },
  { 
    path: '**', 
    redirectTo: '/products' 
  }
];