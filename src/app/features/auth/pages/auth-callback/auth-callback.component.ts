import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="callback-container">
      <h3>Procesando autenticación...</h3>
      <p>Por favor espera...</p>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('=== CALLBACK AUTH ===');
    
    // ✅ Esperar un momento para que OAuth2 procese
    setTimeout(() => {
        const isAuth = this.authService.isAuthenticated();
        console.log('¿Está autenticado?', isAuth);
        console.log('Token disponible:', !!this.authService.getAccessToken());
        
        if (isAuth) {
        console.log('Roles del usuario:', this.authService.getUserRoles());
        // ✅ Forzar actualización del estado en AuthService
        this.authService.updateAuthenticationState();
        }
        
        // Redirigir después de verificar
        this.router.navigate(['/products']);
    }, 1000); // ← Aumentar delay a 1 segundo
  }
}