import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { routes } from './app/app.routes';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './app/core/auth/auth.service';

// ✅ Función interceptor completa
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  console.log('🔍 Interceptor: URL:', req.url);

  const apiCheck = isApiRequest(req.url);
  console.log('🔄 Resultado de isApiRequest:', apiCheck);
  
 // Solo agregar token para peticiones a tu API backend
  if (apiCheck) {
    console.log('✅ Es petición API, agregando token...');
    return addTokenToRequest(req, next);
  }
  
  console.log('⏭️ No es petición API, continuando sin token');
  return next(req);
}

function isApiRequest(url: string): boolean {
  const isApi = url.includes('/api/') || 
         url.includes('communities/') || 
         url.includes('listings/') ||
         url.includes('localhost:8000') ||
         url.includes('s.jatic.com.ar');
         
  console.log('🎯 isApiRequest para:', url, '-> Resultado:', isApi);
  return isApi;
}

function addTokenToRequest(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // Obtener AuthService usando inject
  const authService = inject(AuthService);
  const token = authService.getAccessToken();
  
  console.log('🔑 Token obtenido:', token ? 'SÍ (longitud: ' + token.length + ')' : 'NO');
  
  if (token) {
    console.log('✅ Agregando token Bearer al header');
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    console.log('📤 Authorization header:', authReq.headers.get('Authorization'));
    return next(authReq);
  }
  
  console.log('⚠️ No hay token, enviando petición sin Authorization header');
  return next(req);
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideOAuthClient()
  ]
}).catch(err => console.error(err));