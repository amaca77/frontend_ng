import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  constructor() {
    console.log('🚀 AuthInterceptor creado!'); // ← Agregar esta línea
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Solo agregar token para peticiones a tu API backend
    if (this.isApiRequest(request.url)) {
      return this.addTokenToRequest(request, next);
    }
    
    return next.handle(request);
  }

  private addTokenToRequest(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Obtener el token de tu AuthService existente
    const token = this.authService.getAccessToken();
    
    if (token) {
      // Clonar la petición y agregar el header Authorization
      const authRequest = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      });
      
      return next.handle(authRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          // Si recibimos un 401, redirigir al login
          if (error.status === 401) {
            console.error('Token expirado o inválido, redirigiendo al login');
            this.authService.login();
            return throwError(() => new Error('Unauthorized - redirecting to login'));
          }
          return throwError(() => error);
        })
      );
    }
    
    return next.handle(request);
  }

  private isApiRequest(url: string): boolean {
    // Verificar si la URL es una petición a tu API backend
    const isApi = url.includes('/api/') || 
           url.includes('communities/') || 
           url.includes('listings/') ||
           url.includes('localhost:8000') ||
           url.includes('s.jatic.com.ar'); // Tu servidor de producción
           
    console.log('🎯 isApiRequest para:', url, '-> Resultado:', isApi);
    return isApi;
  }
}