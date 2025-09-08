import { Routes } from '@angular/router';
import { AuthCallbackComponent } from './features/auth/pages/auth-callback/auth-callback.component';

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
    path: '**', 
    redirectTo: '/products' 
  }
];