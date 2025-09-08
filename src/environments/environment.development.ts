export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api', // Tu URL de backend actual
  keycloak: {
    url: 'http://localhost:8080',  // Cambiar según ambiente
    realm: 'junto-a-tic',
    clientId: 'junto-a-tic-api'
  }  
};