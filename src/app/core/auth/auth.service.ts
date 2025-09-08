import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject } from 'rxjs';
import { authConfig } from './auth.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private oauthService: OAuthService) {
    this.configureOAuth();
  }

  private configureOAuth(): void {
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  login(): void {
    this.oauthService.initLoginFlow();
  }

  logout(): void {
    console.log('Cerrando sesión...');
    this.oauthService.logOut();
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken();
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
}