import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    const fullUrl = `${this.baseUrl}/${endpoint}`;
    console.log('🌐 API Request:', fullUrl);

    return this.http.get<T>(fullUrl, { params: httpParams })
      .pipe(
        tap((response) => {
          console.log('✅ API Response:', response);
        }),
        retry(1),
        catchError(this.handleError)
      );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    const fullUrl = `${this.baseUrl}/${endpoint}`;
    console.log('🌐 API POST:', fullUrl, data);
    
    return this.http.post<T>(fullUrl, data)
      .pipe(
        tap((response) => {
          console.log('✅ API POST Response:', response);
        }),
        catchError(this.handleError)
      );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    const fullUrl = `${this.baseUrl}/${endpoint}`;
    console.log('🌐 API PUT:', fullUrl, data);
    
    return this.http.put<T>(fullUrl, data)
      .pipe(
        tap((response) => {
          console.log('✅ API PUT Response:', response);
        }),
        catchError(this.handleError)
      );
  }

  delete<T>(endpoint: string): Observable<T> {
    const fullUrl = `${this.baseUrl}/${endpoint}`;
    console.log('🌐 API DELETE:', fullUrl);
    
    return this.http.delete<T>(fullUrl)
      .pipe(
        tap((response) => {
          console.log('✅ API DELETE Response:', response);
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente (red, etc.)
      errorMessage = `Error de cliente: ${error.error.message}`;
    } else {
      // Error del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar al servidor. Verifica que esté corriendo en localhost:8000';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('❌ API Error:', errorMessage, error);
    return throwError(() => errorMessage);
  }
}