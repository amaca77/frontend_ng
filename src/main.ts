import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app/app.routes';
import { provideOAuthClient } from 'angular-oauth2-oidc';

bootstrapApplication(AppComponent, {
  providers: [
    /*provideRouter(routes, withComponentInputBinding()),*/
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    provideOAuthClient()
  ]
}).catch(err => console.error(err));