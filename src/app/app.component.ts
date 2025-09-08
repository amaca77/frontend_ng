import { Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/auth/auth.service';


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
        <button mat-icon-button (click)="handleAccountClick()" 
                [title]="isAuthenticated ? 'Cerrar sesión' : 'Iniciar sesión'">
          <mat-icon>account_circle</mat-icon>
        </button>
        <span class="user-status">
          {{ isAuthenticated ? 'Logueado' : 'No logueado' }}
        </span>
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
  private router = inject(Router);
  private authService = inject(AuthService);
  isAuthenticated = false;

  ngOnInit() {
    // ✅ Suscribirse a cambios de autenticación
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        console.log('Usuario logueado - Roles:', this.authService.getUserRoles());
      }
    });
    
    // Verificación inicial
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    this.isAuthenticated = this.authService.isAuthenticated();
    // ✅ Mostrar roles en consola si está logueado
    if (this.isAuthenticated) {
      console.log('Usuario logueado - Roles:', this.authService.getUserRoles());
    }
  }

  handleAccountClick() {
    if (this.isAuthenticated) {
      // ✅ Hacer logout si está logueado
      const confirmLogout = confirm('¿Deseas cerrar sesión?');
      if (confirmLogout) {
        this.authService.logout();
        // Actualizar estado después del logout
        setTimeout(() => {
          this.checkAuthStatus();
        }, 100);
      }
    } else {
      // Si no está logueado, ir al login
      this.router.navigate(['/login']);
    }
  }



  goToLogin() {
    this.router.navigate(['/login']);
  }
}