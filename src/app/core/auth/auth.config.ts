import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';
/*
export const authConfig: AuthConfig = {
  issuer: 'http://localhost:8080/realms/junto-a-tic',
  redirectUri: window.location.origin + '/auth/callback',
  clientId: 'junto-a-tic-api',
  responseType: 'code',
  scope: 'openid profile email',
  requireHttps: false, // Solo para desarrollo
  showDebugInformation: true // Solo para desarrollo
};
*/

export const authConfig: AuthConfig = {
  issuer: `${environment.keycloak.url}/realms/${environment.keycloak.realm}`,
  redirectUri: window.location.origin + '/auth/callback',
  clientId: environment.keycloak.clientId,
  responseType: 'code',
  scope: 'openid profile email',
  requireHttps: environment.production,  // Solo HTTPS en producción
  showDebugInformation: !environment.production  // Debug solo en desarrollo
};