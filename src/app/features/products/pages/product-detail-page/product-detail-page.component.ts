import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDetailComponent } from '../../components/product-detail/product-detail.component';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, ProductDetailComponent],
  template: `
    <div class="page-container">
      <app-product-detail></app-product-detail>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background-color: #fafafa;
    }
  `]
})
export class ProductDetailPageComponent { }