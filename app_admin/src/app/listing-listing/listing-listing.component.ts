import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingDataService, Listing } from '../services/listing-data.service';
import { ListingCardComponent } from '../listing-card/listing-card.component';

@Component({
  selector: 'app-listing-listing',
  standalone: true,
  imports: [CommonModule, ListingCardComponent],
  templateUrl: './listing-listing.component.html',
  styleUrl: './listing-listing.component.css'
})
export class ListingListingComponent implements OnInit {
  listings: Listing[] = [];

  constructor(private listingService: ListingDataService) {}

  ngOnInit(): void {
    this.listingService.getListings().subscribe({
      next: (data) => (this.listings = data),
      error: (err) => console.error(err),
    });
  }
}
