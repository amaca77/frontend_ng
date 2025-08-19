import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsListComponent } from '../../components/products-list/products-list.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, ProductsListComponent],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="container">
          <h1>Nuestros Productos</h1>
          <p>Descubre nuestra increíble selección de productos</p>
        </div>
      </header>
      <main class="page-content">
        <app-products-list></app-products-list>
      </main>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background-color: #fafafa;
    }
    
    .page-header {
      background: linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%);
      color: white;
      padding: 3rem 0;
      text-align: center;
    }
    
    .page-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 300;
    }
    
    .page-header p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
  `]
})
export class ProductsPageComponent { }