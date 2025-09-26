import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private apiService = inject(ApiService);

  uploadTempImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.apiService.post<any>('images/upload-temp', formData);
  }
}