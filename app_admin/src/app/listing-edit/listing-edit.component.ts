import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { ListingDataService, Listing } from '../services/listing-data.service';

@Component({
  selector: 'app-listing-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listing-edit.component.html'
})
export class ListingEditComponent implements OnInit {
  listingCode = '';
  listing: Listing | null = null;
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
    this.successMessage = '';

    this.listingService.getListing(this.listingCode).subscribe({
      next: (data) => {
        this.listing = data;
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
    this.successMessage = '';

    this.listingService.updateListing(this.listingCode, this.listing).subscribe({
      next: () => {
        this.successMessage = 'Listing updated successfully.';
        this.router.navigate(['/']);
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
      },
    });
  }

  // Delete the current listing and return to the main page.
  onDelete(): void {
    if (!this.listingCode) {
      this.errorMessage = 'Listing code is missing.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.listingService.deleteListing(this.listingCode).subscribe({
      next: () => {
        this.successMessage = 'Listing deleted successfully.';
        this.router.navigate(['/']);
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
      },
    });
  }
}
