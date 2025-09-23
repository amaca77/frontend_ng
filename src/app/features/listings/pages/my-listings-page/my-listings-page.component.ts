// src/app/features/listings/pages/my-listings-page/my-listings-page.component.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { MyListingsService, MyListing } from '../../services/my-listings.service';
import { ListingCardComponent } from '../../components/listing-card/listing-card.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-my-listings-page',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ListingCardComponent,
    MatTableModule,    
    MatSortModule,     
    MatMenuModule,
    MatChipsModule,      
    MatTooltipModule,
    MatPaginatorModule  
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>
          <mat-icon>store</mat-icon>
          Mis Publicaciones
        </h1>
        <button mat-raised-button color="primary" (click)="createNewListing()">
          <mat-icon>add</mat-icon>
          Nueva Publicación
        </button>
      </div>

      <div class="content">
        @if (loading()) {
          <div class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Cargando publicaciones...</p>
          </div>
        } @else if (listings().length === 0) {
          <div class="empty-state">
            <mat-card>
              <mat-card-content>
                <div class="empty-content">
                  <mat-icon class="empty-icon">inventory_2</mat-icon>
                  <h2>No tienes publicaciones</h2>
                  <p>Comienza creando tu primera publicación para vender productos.</p>
                  <button mat-raised-button color="primary" (click)="createNewListing()">
                    <mat-icon>add</mat-icon>
                    Crear Primera Publicación
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        } @else {
        <mat-table [dataSource]="listings()" class="listings-table">
            <!-- Columna Imagen -->
            <ng-container matColumnDef="image">
            <mat-header-cell *matHeaderCellDef>Imagen</mat-header-cell>
            <mat-cell *matCellDef="let listing">
                <img 
                [src]="getImageUrl(listing)" 
                [alt]="listing.title"
                class="thumbnail"
                (error)="onImageError($event)">
            </mat-cell>
            </ng-container>

            <!-- Columna Título -->
            <ng-container matColumnDef="title">
            <mat-header-cell *matHeaderCellDef>Producto</mat-header-cell>
            <mat-cell *matCellDef="let listing">
                <div class="product-info">
                <span class="product-title">{{ listing.title }}</span>
                <span class="product-description">{{ listing.description }}</span>
                </div>
            </mat-cell>
            </ng-container>

            <!-- Columna Precio -->
            <ng-container matColumnDef="price">
            <mat-header-cell *matHeaderCellDef>Precio</mat-header-cell>
            <mat-cell *matCellDef="let listing">
                <span class="price">\${{ listing.price.toFixed(2) }}</span>
            </mat-cell>
            </ng-container>

            <!-- Columna Stock -->
            <ng-container matColumnDef="stock">
            <mat-header-cell *matHeaderCellDef>Stock</mat-header-cell>
            <mat-cell *matCellDef="let listing">{{ listing.stock }}</mat-cell>
            </ng-container>

            <!-- Columna Estado -->
            <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef>Estado</mat-header-cell>
            <mat-cell *matCellDef="let listing">
                <mat-chip [class]="'status-' + listing.status">
                {{ listing.status | titlecase }}
                </mat-chip>
            </mat-cell>
            </ng-container>

            <!-- Columna Acciones -->
            <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef>Acciones</mat-header-cell>
            <mat-cell *matCellDef="let listing">
                <div class="actions">
                <button mat-icon-button (click)="viewListing(listing.id)" matTooltip="Ver">
                    <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button (click)="editListing(listing.id)" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="toggleListingStatus({id: listing.id, active: listing.status === 'inactive'})" 
                        [matTooltip]="listing.status === 'active' ? 'Desactivar' : 'Activar'">
                    <mat-icon>{{ listing.status === 'active' ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <button mat-icon-button [matMenuTriggerFor]="moreMenu">
                    <mat-icon>more_vert</mat-icon>
                </button>
                
                <mat-menu #moreMenu="matMenu">
                    <button mat-menu-item (click)="updateListingStock(listing.id)">
                    <mat-icon>inventory</mat-icon>
                    <span>Actualizar Stock</span>
                    </button>
                    <button mat-menu-item (click)="duplicateListing(listing.id)">
                    <mat-icon>content_copy</mat-icon>
                    <span>Duplicar</span>
                    </button>
                    <button mat-menu-item (click)="deleteListing(listing.id)" class="delete-action">
                    <mat-icon>delete</mat-icon>
                    <span>Eliminar</span>
                    </button>
                </mat-menu>
                </div>
            </mat-cell>
            </ng-container>

            <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
            <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
        </mat-table>

        <!-- ✅ PAGINADOR -->
        <mat-paginator 
        [length]="totalItems()"
        [pageSize]="pageSize"
        [pageSizeOptions]="[5, 10, 20, 50]"
        [pageIndex]="currentPage() - 1"
        (page)="onPageChange($event)"
        showFirstLastButtons>
        </mat-paginator>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }
    
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }
    
    .page-header h1 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
    }
    
    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        text-align: center;
    }
    
    .empty-state {
        display: flex;
        justify-content: center;
        margin-top: 3rem;
    }
    
    .empty-content {
        text-align: center;
        padding: 2rem;
    }
    
    .empty-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        color: #ccc;
        margin-bottom: 1rem;
    }
    
    /* ✅ ESTILOS PARA LA TABLA */
    .listings-table {
        width: 100%;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .thumbnail {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
    }
    
    .product-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .product-title {
        font-weight: 500;
        color: #333;
    }
    
    .product-description {
        font-size: 0.85rem;
        color: #666;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 200px;
    }
    
    .price {
        font-weight: bold;
        color: #2e7d32;
        font-size: 1.1rem;
    }
    
    .status-active {
        background-color: #4caf50;
        color: white;
    }
    
    .status-inactive {
        background-color: #9e9e9e;
        color: white;
    }
    
    .status-draft {
        background-color: #ff9800;
        color: white;
    }
    
    .actions {
        display: flex;
        gap: 4px;
        align-items: center;
    }
    
    .delete-action {
        color: #f44336;
    }
    
    .delete-action mat-icon {
        color: #f44336;
    }
    
    mat-header-cell {
        font-weight: 600;
        color: #333;
    }
    
    mat-cell, mat-header-cell {
        padding: 16px 8px;
    }
    
    mat-row:hover {
        background-color: #f5f5f5;
    }
    `]
})
export class MyListingsPageComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private myListingsService = inject(MyListingsService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();
  
  loading = signal(false);
  listings = signal<MyListing[]>([]);
  totalItems = signal(0);        // ← NUEVO
  currentPage = signal(1);       // ← NUEVO
  pageSize = 10;                 // ← NUEVO

  displayedColumns: string[] = ['image', 'title', 'price', 'stock', 'status', 'actions'];

  getImageUrl(listing: MyListing): string {
    if (listing.image_url) {
      if (listing.image_url.startsWith('http')) {
        return listing.image_url;
      }
      return `https://cdn.jatic.com.ar${listing.image_url}`;
    }
    return 'assets/images/placeholder.jpg';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder.jpg';
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize = event.pageSize;
    this.loadMyListings();
  }
  
  
  ngOnInit() {
    // Verificar que el usuario tenga rol de advertiser
    if (!this.hasAdvertiserRole()) {
      this.snackBar.open('No tienes permisos para acceder a esta sección', 'Cerrar', {
        duration: 3000
      });
      this.router.navigate(['/products']);
      return;
    }
    
    this.loadMyListings();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private hasAdvertiserRole(): boolean {
    return this.authService.getUserRoles().includes('advertiser');
  }
  
  private loadMyListings() {
    this.loading.set(true);
    
    this.myListingsService.getMyListings(this.currentPage(), this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
            this.listings.set(response.listings || response);
            this.totalItems.set(response.pagination?.total || 0);
            this.loading.set(false);
          
          console.log('✅ Publicaciones cargadas:', response);
          
          if (response.listings.length > 0) {
            this.snackBar.open(`${response.listings.length} publicaciones cargadas`, 'Cerrar', {
              duration: 2000
            });
          }
        },
        error: (error) => {
          this.loading.set(false);
          console.error('❌ Error cargando publicaciones:', error);
          
          this.snackBar.open('Error al cargar publicaciones', 'Cerrar', {
            duration: 4000
          });
          
          // Mantener array vacío para mostrar estado empty
          this.listings.set([]);
        }
      });
  }
  
  createNewListing() {
    // TODO: Navegar a página de creación
    console.log('Crear nueva publicación');
  }
  
  // Event handlers del ListingCardComponent
  viewListing(id: string) {
    this.router.navigate(['/products', id]);
  }
  
  editListing(id: string) {
    // TODO: Navegar a página de edición
    console.log('Editar publicación:', id);
  }
  
  toggleListingStatus(event: { id: string, active: boolean }) {
    this.myListingsService.toggleListingStatus(event.id, event.active)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedListing) => {
          // Actualizar la lista local
          const updatedListings = this.listings().map(listing => 
            listing.id === event.id ? updatedListing : listing
          );
          this.listings.set(updatedListings);
          
          const statusText = event.active ? 'activada' : 'desactivada';
          this.snackBar.open(`Publicación ${statusText}`, 'Cerrar', {
            duration: 2000
          });
        },
        error: (error) => {
          console.error('Error cambiando estado:', error);
          this.snackBar.open('Error al cambiar estado', 'Cerrar', {
            duration: 3000
          });
        }
      });
  }
  
  updateListingStock(id: string) {
    const listing = this.listings().find(l => l.id === id);
    const newStock = prompt('Nuevo stock:', listing?.stock.toString() || '0');
    
    if (newStock && !isNaN(Number(newStock))) {
      this.myListingsService.updateStock(id, Number(newStock))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedListing) => {
            // Actualizar la lista local
            const updatedListings = this.listings().map(listing => 
              listing.id === id ? updatedListing : listing
            );
            this.listings.set(updatedListings);
            
            this.snackBar.open(`Stock actualizado a ${newStock}`, 'Cerrar', {
              duration: 2000
            });
          },
          error: (error) => {
            console.error('Error actualizando stock:', error);
            this.snackBar.open('Error al actualizar stock', 'Cerrar', {
              duration: 3000
            });
          }
        });
    }
  }
  
  duplicateListing(id: string) {
    // TODO: Implementar duplicación
    console.log('Duplicar publicación:', id);
    this.snackBar.open('Funcionalidad en desarrollo', 'Cerrar', {
      duration: 2000
    });
  }
  
  viewListingStats(id: string) {
    // TODO: Implementar estadísticas
    console.log('Ver estadísticas:', id);
    this.snackBar.open('Funcionalidad en desarrollo', 'Cerrar', {
      duration: 2000
    });
  }
  
  deleteListing(id: string) {
    const listing = this.listings().find(l => l.id === id);
    const confirmMessage = `¿Estás seguro de que quieres eliminar "${listing?.title}"?`;
    
    if (confirm(confirmMessage)) {
      this.myListingsService.deleteListing(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Remover de la lista local
            const updatedListings = this.listings().filter(l => l.id !== id);
            this.listings.set(updatedListings);
            
            this.snackBar.open('Publicación eliminada exitosamente', 'Cerrar', {
              duration: 2000
            });
          },
          error: (error) => {
            console.error('Error eliminando publicación:', error);
            this.snackBar.open('Error al eliminar publicación', 'Cerrar', {
              duration: 3000
            });
          }
        });
    }
  }
}