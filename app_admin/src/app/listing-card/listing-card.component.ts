import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Listing } from '../services/listing-data.service';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.css'
})
export class ListingCardComponent {
  @Input() listing!: Listing;
}
