import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
 
// attach the stored JWT to every outgoing HTTP request when the user is logged in.
// the backend enforces auth on write endpoints (POST/PUT/DELETE);
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
 
  if (!token) {
    return next(req);
  }
 
  const authorized = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
 
  return next(authorized);
};
