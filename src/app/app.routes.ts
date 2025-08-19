import { Routes } from '@angular/router';

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
    path: '**', 
    redirectTo: '/products' 
  }
];