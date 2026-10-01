import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, ParamMap } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule} from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ListingDataService, Listing } from '../services/listing-data.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-listing-edit',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './listing-edit.component.html',
  styleUrl: './listing-edit.component.css'
})
export class ListingEditComponent {
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  listingCode = '';
  listing: Listing | null = null;
  startDateInput = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listingService: ListingDataService
  ) {}

  ngOnInit(): void {
    // Read the current listing code from the route and load the matching listing.
    this.route.paramMap.subscribe({
      next: (params: ParamMap) => {
        this.listingCode = params.get('listingCode') || '';

        if (!this.listingCode) {
          this.errorMessage = 'Listing code is missing.';
          this.listing = null;
          return;
        }

        this.loadListing();
      }
    });
  }

  // Load the selected listing and update the component state.
  loadListing(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.listingService.getListing(this.listingCode).subscribe({
      next: (data) => {
        this.listing = data;
        this.startDateInput = data.start ? data.start.substring(0, 10) : '';
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        this.listing = null;
        this.isLoading = false;
      },
    });
  }

  // Save any edits made to the current listing.
  onSave(): void {
    if (!this.listing) {
      this.errorMessage = 'Listing data is unavailable.';
      return;
    }

    this.errorMessage = '';

    // Send the picked date back as an ISO string.
    const payload: Listing = {
      ...this.listing,
      start: this.startDateInput
        ? new Date(this.startDateInput).toISOString()
        : this.listing.start
    };
  
    this.listingService.updateListing(this.listingCode, payload).subscribe({
      next: () => {
        this.snackBar.open('Listing updated', 'Dismiss', { duration: 3000});
        this.router.navigate(['/']);
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
      },
    });
  }

  // Delete the current listing and return to the main page.
  onDelete(): void {
    if (!this.listing) return;
      
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Listing?',
        message: `This will permanently delete "${this.listing.name}" (${this.listing.code}). This cannot be undone`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (!confirm) return;
    
    this.listingService.deleteListing(this.listingCode).subscribe({
      next: () => {
        this.snackBar.open('Listing deleted', 'Dismiss', { duration: 3000});
        this.router.navigate(['/']);
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
      },
    });
  });
}
}

