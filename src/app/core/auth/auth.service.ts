import { Injectable } from '@angular/core';
import { OAuthService, OAuthEvent  } from 'angular-oauth2-oidc';
import { BehaviorSubject , filter } from 'rxjs';
import { authConfig } from './auth.config';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private oauthService: OAuthService) {
    this.configureOAuth();
    this.setupEventListeners();
  }

  private configureOAuth(): void {
    this.oauthService.configure(authConfig);
    
    // ✅ MANTENER: Storage explícito 
    this.oauthService.setStorage(sessionStorage);
    
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      this.oauthService.setupAutomaticSilentRefresh();
      
      // ✅ MANTENER: Actualizar estado SIEMPRE (no solo si hay token)
      console.log('OAuth configuration loaded, updating auth state...');
      this.updateAuthenticationState();
    });
  }

  private setupEventListeners(): void {
  // ✅ Escuchar eventos de OAuth para mejor gestión del estado
  this.oauthService.events
    .pipe(filter(e => ['token_received', 'token_refreshed', 'token_expires'].includes(e.type)))
    .subscribe((event: OAuthEvent) => {
      console.log('🔄 OAuth Event:', event.type);
      this.updateAuthenticationState();
    });

  // ✅ Manejar errores de refresh
  this.oauthService.events
    .pipe(filter(e => e.type === 'silent_refresh_error'))
    .subscribe(() => {
      console.warn('⚠️ Error en silent refresh, redirigiendo al login');
      this.login();
    });
  }

  login(): void {
    this.oauthService.initLoginFlow();
  }

  register(): void {
    const registerUrl = `${authConfig.issuer}/protocol/openid-connect/registrations?client_id=${authConfig.clientId}&redirect_uri=${authConfig.redirectUri}&response_type=code&scope=openid`;
    window.location.href = registerUrl;
  }

  logout(): void {
    console.log('Cerrando sesión...');
    this.oauthService.logOut();
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    const isAuth = this.oauthService.hasValidAccessToken();
    console.log('🔍 AuthService.isAuthenticated():', {
      hasValidAccessToken: isAuth,
      accessToken: this.oauthService.getAccessToken() ? 'exists' : 'missing'
    });
    return isAuth;
  }

  getAccessToken(): string | null {
    return this.oauthService.getAccessToken();
  }

  getUserRoles(): string[] {
    const claims = this.oauthService.getIdentityClaims() as any;
    const allRoles = claims?.realm_access?.roles || [];

    // ✅ Filtrar solo roles de negocio
    const businessRoles = ['consumer', 'advertiser', 'community-admin', 'super-admin'];
    return allRoles.filter((role: string) => businessRoles.includes(role));


  }

  getUserInfo(): any {
    return this.oauthService.getIdentityClaims();
  }
  updateAuthenticationState(): void {
    const isAuth = this.isAuthenticated();
    this.isAuthenticatedSubject.next(isAuth);
    console.log('Estado de autenticación actualizado:', isAuth);
  }

  async refreshToken(): Promise<boolean> {
    try {
      await this.oauthService.silentRefresh();
      this.updateAuthenticationState();
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }
}