import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="app-container">
      <mat-toolbar color="primary" class="app-toolbar">
        <span class="app-brand" routerLink="/">Mi Marketplace</span>
        <span class="spacer"></span>
        <button mat-icon-button>
          <mat-icon>search</mat-icon>
        </button>
        <button mat-icon-button>
          <mat-icon>shopping_cart</mat-icon>
        </button>
        <button mat-icon-button>
          <mat-icon>account_circle</mat-icon>
        </button>
      </mat-toolbar>
      
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .app-brand {
      font-size: 1.2rem;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .app-content {
      margin-top: 64px;
      flex: 1;
      overflow-y: auto;
    }
  `]
})
export class AppComponent {
  title = 'mi-marketplace-app';
}