import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';


@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>account_circle</mat-icon>
            Iniciar Sesión
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <p>Accede con tu cuenta de Keycloak</p>
        </mat-card-content>
        
        <mat-card-actions>
          <button 
            mat-raised-button 
            color="primary" 
            class="login-button"
            (click)="login()">
            <mat-icon>login</mat-icon>
            Iniciar Sesión con Keycloak
          </button>

          <button 
            mat-raised-button 
            color="primary" 
            class="login-button"
            (click)="register()">
            <mat-icon>app_registration</mat-icon>
            Crear cuenta nueva
          </button>
         
          <button 
            mat-button 
            (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Volver
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
      padding: 1rem;
    }
    
    .login-card {
      max-width: 400px;
      width: 100%;
      text-align: center;
    }
    
    mat-card-header {
      display: flex;
      justify-content: center;
      padding-bottom: 1rem;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
    }
    
    mat-card-content {
      padding: 2rem 0;
      color: rgba(0,0,0,0.7);
    }
    
    .login-button {
      width: 100%;
      margin-bottom: 1rem;
      padding: 0.75rem;
    }
    
    mat-card-actions {
      display: flex;
      flex-direction: column;
      padding: 1rem;
    }
  `]
})
export class LoginPageComponent {
  private router = inject(Router);
  constructor(private authService: AuthService) {}

login() {
  console.log('=== INICIANDO LOGIN ===');
  this.authService.login();
}

  register() {
    console.log('Registro con Keycloak');
    this.authService.register();
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}