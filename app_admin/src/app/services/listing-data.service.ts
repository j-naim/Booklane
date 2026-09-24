import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Listing {
  _id?: string;
  code: string;
  name: string;
  length: string;
  start: string;
  resort: string;
  perPerson: string;
  image: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class ListingDataService {
  private readonly baseUrl = '/api/listings';

  constructor(private http: HttpClient) { }

  // Retrieve the full list of listings.
  getListings(): Observable<Listing[]> {
    return this.http
      .get<Listing[]>(this.baseUrl)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Retrieve one listing by its listing code.
  getListing(listingCode: string): Observable<Listing> {
    return this.http
      .get<Listing>(`${this.baseUrl}/${listingCode}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Send a new listing to the API for creation.
  addListing(listing: Listing): Observable<Listing> {
    return this.http
      .post<Listing>(this.baseUrl, listing)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Update an existing listing by code.
  updateListing(listingCode: string, listing: Listing): Observable<Listing> {
    return this.http
      .put<Listing>(`${this.baseUrl}/${listingCode}`, listing)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Delete a listing by code.
  deleteListing(listingCode: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${listingCode}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Centralize API error handling so components don't repeat the same logic.
  private handleError(error: HttpErrorResponse) {
    const message =
      error.error?.message ||
      error.error?.details?.join(', ') ||
      'An unexpected error occurred while processing listing data.';

    return throwError(() => new Error(message));
  }
}
