import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';

export const authConfig: AuthConfig = {
  issuer: `${environment.keycloak.url}/realms/${environment.keycloak.realm}`,
  redirectUri: window.location.origin + '/auth/callback',
  clientId: environment.keycloak.clientId,
  responseType: 'code',
  scope: 'openid profile email',
  requireHttps: environment.production,  // Solo HTTPS en producción
  showDebugInformation: !environment.production,  // Debug solo en desarrollo

    // ✅ AGREGAR ESTAS CONFIGURACIONES PARA PERSISTIR SESIÓN:
  sessionChecksEnabled: true,
  clearHashAfterLogin: false,
  nonceStateSeparator: 'semicolon',
  
  // ✅ Token refresh automático
  silentRefreshRedirectUri: window.location.origin + '/assets/silent-refresh.html',
  silentRefreshTimeout: 5000,
  
  // ✅ Configuración para que persista la sesión
  disableAtHashCheck: true
};