import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ListingDataService, Listing } from '../services/listing-data.service';
import { ListingCardComponent } from '../listing-card/listing-card.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-listing-listing',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ListingCardComponent],
  templateUrl: './listing-listing.component.html',
  styleUrl: './listing-listing.component.css'
})
export class ListingListingComponent implements OnInit {
  listings: Listing[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private listingService: ListingDataService,
    protected authService: AuthService
   ) {}

  ngOnInit(): void {
    this.listingService.getListings().subscribe({
      next: (data) => {
        this.listings = data,
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }
}
