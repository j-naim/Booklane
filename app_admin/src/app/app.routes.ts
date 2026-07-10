import { Routes } from '@angular/router';
import { ListingListingComponent } from './listing-listing/listing-listing.component';
import { ListingAddComponent } from './listing-add/listing-add.component';
import { ListingEditComponent } from './listing-edit/listing-edit.component';

export const routes: Routes = [
  { path: '', component: ListingListingComponent },
  { path: 'add', component: ListingAddComponent },
  { path: 'edit/:listingCode', component: ListingEditComponent },
];
