import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListingDataService, Listing } from '../services/listing-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listing-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listing-add.component.html'
})
export class ListingAddComponent {
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

  constructor(private listingService: ListingDataService, private router: Router) {}

  onSubmit(): void {
    this.listingService.addListing(this.listing).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => console.error(err),
    });
  }
}
