import { Component,inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { ProductsService } from '../../../products/services/products.service';
import { MyListingsService } from '../../services/my-listings.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ImageUploadService } from '../../services/image-upload.service';

@Component({
  selector: 'app-edit-listing-page',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="page-container">
    <div class="page-header">
        <h1>
        <mat-icon>add</mat-icon>
        {{ isEditMode ? 'Editar Publicación' : 'Crear Nueva Publicación' }}
        </h1>
    </div>
    
    <form [formGroup]="listingForm" class="listing-form">
        <mat-radio-group formControlName="type">
        <mat-label>Tipo de publicación</mat-label>
        <mat-radio-button value="product">Producto</mat-radio-button>
        <mat-radio-button value="service">Servicio</mat-radio-button>
        </mat-radio-group>

        <mat-form-field appearance="outline">
        <mat-label>Categoría</mat-label>
        <mat-select formControlName="category_id">
            <mat-option *ngFor="let category of categories()" [value]="category.id">
            {{ category.displayName }}
            </mat-option>
        </mat-select>
        </mat-form-field>

        <div *ngIf="listingForm.get('type')?.value === 'product'" class="delivery-methods-section">
        <mat-label>Métodos de entrega disponibles</mat-label>
            <div class="delivery-methods-list">
                <mat-checkbox 
                *ngFor="let method of deliveryMethods()" 
                [checked]="isDeliveryMethodSelected(method.id)"
                (change)="toggleDeliveryMethod(method.id, $event.checked)">
                {{ method.name }} 
                <span class="method-cost" *ngIf="method.cost > 0">
                    (+$ {{ method.cost }})
                </span>
                </mat-checkbox>
            </div>
        </div>

        <div class="images-section">
            <h3>
                <mat-icon>photo_library</mat-icon>
                Imágenes del producto
            </h3>
            
            <!-- Drag & Drop Zone -->
            <div class="upload-zone" 
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onFileDrop($event)"
                (click)="fileInput.click()">
                <mat-icon>cloud_upload</mat-icon>
                <p>Arrastra imágenes aquí o haz clic para seleccionar</p>
                <p class="upload-hint">Máximo 5 imágenes, 2 MB cada una</p>
                
                <input #fileInput type="file" 
                    accept="image/*" 
                    multiple 
                    style="display: none"
                    (change)="onFileSelected($event)">
            </div>
            
            <!-- Preview de imágenes -->
            <div class="images-preview" *ngIf="tempImages().length > 0">
                <div class="image-item" *ngFor="let img of tempImages(); let i = index">
                <img [src]="img.temp_url" [alt]="img.filename">
                <div class="image-actions">
                    <button mat-icon-button (click)="removeImage(i)">
                    <mat-icon>delete</mat-icon>
                    </button>
                </div>
                </div>
            </div>
        </div>

        <div class="publish-section">
        <mat-slide-toggle formControlName="is_active">
            <span class="toggle-label">
            <mat-icon>{{ listingForm.get('is_active')?.value ? 'visibility' : 'visibility_off' }}</mat-icon>
            {{ listingForm.get('is_active')?.value ? 'Publicar inmediatamente' : 'Guardar como borrador' }}
            </span>
        </mat-slide-toggle>
        <p class="toggle-hint">
            {{ listingForm.get('is_active')?.value ? 
            'La publicación será visible para los compradores' : 
            'Puedes activarla más tarde desde "Mis Publicaciones"' }}
        </p>
        </div>

        <div class="publish-section">
        <mat-slide-toggle formControlName="is_featured">
            <span class="toggle-label">
            <mat-icon>{{ listingForm.get('is_featured')?.value ? 'workspace_premium' : 'featured_play_list' }}</mat-icon>
            {{ listingForm.get('is_featured')?.value ? 'Artículo Destacado' : 'Artículo Normal' }}
            </span>
        </mat-slide-toggle>
        <p class="toggle-hint">
            {{ listingForm.get('is_featured')?.value ? 
            'La publicación será destacada en la tienda' : 
            'Publicación clásica' }}
        </p>
        </div>

        <mat-form-field appearance="outline">
        <mat-label>Título</mat-label>
        <input matInput formControlName="title" maxlength="100">
        <mat-hint>Máximo 100 caracteres</mat-hint>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
        <mat-label>Descripción corta</mat-label>
        <textarea matInput formControlName="short_description" maxlength="200" rows="3"></textarea>
        <mat-hint>Máximo 200 caracteres</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline">
        <mat-label>Descripción larga (opcional)</mat-label>
        <textarea matInput formControlName="long_description" maxlength="1000" rows="5"></textarea>
        <mat-hint>Máximo 1000 caracteres. Descripción detallada del producto</mat-hint>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
        <mat-label>Precio</mat-label>
        <input matInput type="number" formControlName="price" step="0.01">
        </mat-form-field>

        <mat-form-field appearance="outline">
        <mat-label>Precio de lista (opcional)</mat-label>
        <input matInput type="number" formControlName="list_price" step="0.01">
        <mat-hint>Precio tachado si es mayor al precio</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline">
        <mat-label>Stock inicial</mat-label>
        <input matInput type="number" formControlName="stock_quantity" min="0">
        </mat-form-field>

        <mat-form-field appearance="outline">
        <mat-label>Cantidad máxima por pedido</mat-label>
        <input matInput type="number" formControlName="max_quantity_per_order" min="1">
        </mat-form-field>

        <div class="form-actions">
        <button mat-raised-button color="primary" 
                [disabled]="listingForm.invalid" 
                (click)="onSubmit()">
            {{ isEditMode ? 'Guardar Cambios' : 'Crear Publicación' }}
        </button>
        
        <button mat-button (click)="onCancel()">
            Cancelar
        </button>
        </div>

    </form>
    </div>
  `,
    styles: [`
        .page-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        }
        
        .listing-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        }
        
        mat-form-field {
        width: 100%;
        }

        mat-radio-group {
            display: flex;
            flex-direction: column;
            margin: 16px 0;
        }

        .delivery-methods-section {
        margin: 16px 0;
        }

        .delivery-methods-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
        }

        .method-cost {
        color: #666;
        font-size: 0.9em;
        }

        .form-actions {
        margin-top: 24px;
        display: flex;
        gap: 16px;
        }

        .publish-section {
        margin: 24px 0;
        padding: 16px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        }

        .toggle-label {
        display: flex;
        align-items: center;
        gap: 8px;
        }

        .toggle-hint {
        margin-top: 8px;
        font-size: 0.9em;
        color: #666;
        }

        .images-section {
        margin: 24px 0;
        padding: 16px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        }

        .images-section h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        }

        .upload-zone {
        border: 2px dashed #ccc;
        border-radius: 8px;
        padding: 40px;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.3s;
        }

        .upload-zone:hover {
        border-color: #3f51b5;
        }

        .upload-zone mat-icon {
        font-size: 48px;
        color: #666;
        margin-bottom: 16px;
        }

        .upload-hint {
        color: #666;
        font-size: 0.9em;
        margin: 8px 0 0 0;
        }

        .images-preview {
        display: flex;
        gap: 16px;
        margin-top: 16px;
        flex-wrap: wrap;
        }

        .image-item {
        position: relative;
        width: 120px;
        height: 120px;
        }

        .image-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #ddd;
        }

        .image-actions {
        position: absolute;
        top: 4px;
        right: 4px;
        }
    `]  
})
export class EditListingPageComponent implements OnInit{
    private fb = inject(FormBuilder);
    private productsService = inject(ProductsService);
    private myListingsService = inject(MyListingsService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private snackBar = inject(MatSnackBar);
    private imageService = inject(ImageUploadService);


    categories = signal<any[]>([]);
    deliveryMethods = signal<any[]>([]);
    tempImages = signal<any[]>([]);
    listingId: string | null = null;
    isEditMode = true; 
    originalImages: string[] = [];

    ngOnInit() {
        this.listingId = this.route.snapshot.paramMap.get('id');
        
        if (this.listingId) {
            this.loadListing(this.listingId);
        }
        
        this.loadCategories();
        this.loadDeliveryMethods();
        }

        private loadListing(id: string) {
        this.myListingsService.getListing(id).subscribe({
            next: (listing) => {
            this.populateForm(listing);
            },
            error: (error) => {
            console.error('Error loading listing:', error);
            this.snackBar.open('Error al cargar publicación', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/my-listings']);
            }
        });
    }

    isDeliveryMethodSelected(methodId: string): boolean {
        const selectedMethods = this.listingForm.get('delivery_method_ids')?.value || [];
        return selectedMethods.includes(methodId);
    }

    toggleDeliveryMethod(methodId: string, isChecked: boolean) {
        const currentMethods = this.listingForm.get('delivery_method_ids')?.value || [];
        
        let updatedMethods;
        if (isChecked) {
            updatedMethods = [...currentMethods, methodId];
        } else {
            updatedMethods = currentMethods.filter((id: string) => id !== methodId);
        }
        
        this.listingForm.patchValue({
            delivery_method_ids: updatedMethods
        });
    }

    onSubmit() {
        if (this.listingForm.valid && this.listingId) {
            const formData = {
                ...this.listingForm.value,
                temp_image_ids: this.tempImages().map(img => img.temp_id)                
            };
            const originalImageIds = this.originalImages || [];

            // Imágenes actuales que son existentes
            const currentExistingIds = this.tempImages()
                .filter(img => img.is_existing)
                .map(img => img.temp_id);

             // IDs de imágenes a eliminar
            const imagesToDelete = originalImageIds.filter(id => !currentExistingIds.includes(id));

            // Solo enviar IDs de imágenes nuevas (sin is_existing)
            const newImageIds = this.tempImages()
                .filter(img => !img.is_existing)
                .map(img => img.temp_id);

            this.listingForm.patchValue({
                temp_image_ids: newImageIds,
                delete_image_ids: imagesToDelete
            });
            console.log('Form data with images:', formData);
            
            this.myListingsService.updateListing(this.listingId, this.listingForm.value).subscribe({
            next: (response) => {
                this.snackBar.open('Publicación actualizada exitosamente', 'Cerrar', { duration: 3000 });
                this.router.navigate(['/my-listings']);
            },
            error: (error) => {
                console.error('Error updating listing:', error);
                this.snackBar.open('Error al actualizar publicación', 'Cerrar', { duration: 4000 });
            }
            });
        }
    }
    
    onCancel() {
        this.router.navigate(['/my-listings']);
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    onFileDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        
        const files = event.dataTransfer?.files;
        if (files) {
            this.handleFiles(Array.from(files));
        }
    }

    onFileSelected(event: any) {
        const files = event.target.files;
        if (files) {
            this.handleFiles(Array.from(files));
        }
    }

    private handleFiles(files: File[]) {
        files.forEach(file => {
            if (this.tempImages().length >= 5) {
            this.snackBar.open('Máximo 5 imágenes permitidas', 'Cerrar', { duration: 3000 });
            return;
            }
            
            this.uploadFile(file);
        });
    }

    private uploadFile(file: File) {
        this.imageService.uploadTempImage(file).subscribe({
            next: (response) => {
                // Actualizar signal
                this.tempImages.update(images => [...images, response]);
                
                // Sincronizar con FormGroup
                const currentIds = this.tempImages().map(img => img.temp_id);
                this.listingForm.patchValue({
                    temp_image_ids: currentIds
                });
            },
            error: (error) => {
                console.error('Error uploading image:', error);
                this.snackBar.open('Error al subir imagen', 'Cerrar', { duration: 3000 });
            }
        });
    }

    removeImage(index: number) {
        this.tempImages.update(images => images.filter((_, i) => i !== index));
        
        // Sincronizar con FormGroup
        const currentIds = this.tempImages().map(img => img.temp_id);
        this.listingForm.patchValue({
            temp_image_ids: currentIds
    });
    }


    private loadDeliveryMethods() {
        this.myListingsService.getMyDeliveryMethods().subscribe({
        next: (methods) => {
            this.deliveryMethods.set(methods);
        },
        error: (error) => {
            console.error('Error loading delivery methods:', error);
        }
        });
    }

    private loadCategories() {
        this.productsService.getCategories().subscribe({
            next: (categories) => {
            // Filtrar solo categorías hoja (que tienen parent_id)
            const leafCategories = categories
                .filter(cat => cat.parent_id !== null)
                .map(cat => {
                // Encontrar categoría padre
                const parent = categories.find(p => p.id === cat.parent_id);
                return {
                    ...cat,
                    displayName: parent ? `${parent.name} → ${cat.name}` : cat.name
                };
                });
            
            this.categories.set(leafCategories);
            },
            error: (error) => {
            console.error('Error loading categories:', error);
            }
        });
    }

    private populateForm(listing: any) {
        this.listingForm.patchValue({
            type: listing.type,
            title: listing.title,
            short_description: listing.short_description,
            long_description: listing.long_description || '',
            price: listing.price,
            list_price: listing.list_price,
            stock_quantity: listing.stock_quantity,
            max_quantity_per_order: listing.max_quantity_per_order,
            category_id: listing.category?.id || listing.category_id,
            is_active: listing.is_active,
            is_featured: listing.is_featured || false
        });
        
        // Cargar delivery methods si existen
        if (listing.delivery_methods) {
            const methodIds = listing.delivery_methods.map((m: any) => m.id);
            this.listingForm.patchValue({ delivery_method_ids: methodIds });
        }
        
        // Cargar imágenes existentes
        if (listing.images && listing.images.length > 0) {
            const existingImages = listing.images.map((img: any) => ({
                temp_id: img.id,
                temp_url: `https://cdn.jatic.com.ar${img.image_url}`,  // URL completa del CDN
                filename: img.alt_text || 'Imagen existente',
                is_existing: true  // Flag para identificar que ya existe
            }));
        
            this.tempImages.set(existingImages);
        }

    }
        
    listingForm: FormGroup = this.fb.group({
        type: ['product', [Validators.required]],
        title: ['', [Validators.required, Validators.maxLength(100)]],
        short_description: ['', [Validators.required, Validators.maxLength(200)]],
        long_description: [''],
        price: [0, [Validators.required, Validators.min(0.01)]],
        list_price: [null],
        stock_quantity: [0, [Validators.required, Validators.min(0)]],
        max_quantity_per_order: [1, [Validators.required, Validators.min(1)]],
        category_id: ['', [Validators.required]],
        delivery_method_ids: [[]],
        is_active: [false],
        is_featured: [false],
        temp_image_ids: [[]] 
    });
}