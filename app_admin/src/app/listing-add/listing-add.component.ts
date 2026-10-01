import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card'; 
import { MatSnackBar } from '@angular/material/snack-bar';
import { ListingDataService, Listing } from '../services/listing-data.service';


@Component({
  selector: 'app-listing-add',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './listing-add.component.html',
  styleUrl: './listing-add.component.css'
})
export class ListingAddComponent {
  private readonly snackBar = inject(MatSnackBar);

  listing: Listing = {
    code: '',
    name: '',
    length: '',
    start: '',
    resort: '',
    perPerson: '',
    image: '',
    description: ''
  };

  startDateInput = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(private listingService: ListingDataService, private router: Router) {}

  onSubmit(): void {
    if (this.isSubmitting) return;

    this.errorMessage = '';
    this.isSubmitting = true;

    const payload: Listing = {
      ...this.listing,
      start: this.startDateInput
      ? new Date(this.startDateInput).toISOString()
      : this.listing.start
    };

    this.listingService.addListing(payload).subscribe({
      next: () => {
        this.snackBar.open('Listing created', 'Dismiss', { duration: 3000});
        this.router.navigate(['/']);
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        this.isSubmitting = false;
      },
    });
  }
}