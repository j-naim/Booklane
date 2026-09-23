import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';

interface LoginResponse {
  token: string;
}

interface JwtPayload {
  _id: string;
  email: string;
  name: string;
  exp: number;
  iat: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'booklane-token';
  private readonly authState = signal<boolean>(this.hasValidToken());

  // read-only signal for components to react to auth state changes.
  readonly isLoggedIn = computed(() => this.authState());

  constructor(private http: HttpClient) {}

  // attempt to log in with credentials. On success, store the token and update state.
  login(email: string, password: string): Observable<void> {
    return this.http
      .post<LoginResponse>('/api/login', { email, password })
      .pipe(
        tap((response) => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this.authState.set(true);
        }),
        map(() => void 0),
        catchError((error: HttpErrorResponse) => {
          const message =
            error.error?.message ||
            'Login failed. Please check your credentials.';
          return throwError(() => new Error(message));
        })
      );
  }

  // clear the token and reset state. 
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.authState.set(false);
  }

  // retrieve the current token for use by the auth interceptor.
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // get the current user's name from the token payload, if logged in.
  currentUserName(): string | null {
    const payload = this.decodeToken();
    return payload?.name || null;
  }

  // check whether a stored token exists and not expired.
  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;

    const payload = this.decodeToken(token);
    if (!payload) return false;

    // exp is in seconds, Date.now() is in ms.
    const isExpired = payload.exp * 1000 < Date.now();
    if (isExpired) {
      // clean up expired token so it doesn't keep failing requests.
      localStorage.removeItem(this.TOKEN_KEY);
      return false;
    }

    return true;
  }

  // decode the JWT payload without verifying the signature.
  private decodeToken(token?: string): JwtPayload | null {
    const t = token || localStorage.getItem(this.TOKEN_KEY);
    if (!t) return null;

    try {
      const payloadBase64 = t.split('.')[1];
      const payloadJson = atob(payloadBase64);
      return JSON.parse(payloadJson) as JwtPayload;
    } catch {
      return null;
    }
  }
}