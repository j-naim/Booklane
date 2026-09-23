import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
 
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
 
  errorMessage = '';
  isSubmitting = false;
 
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });
 
  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      return;
    }
 
    this.errorMessage = '';
    this.isSubmitting = true;
 
    const { email, password } = this.loginForm.value;
 
    this.authService.login(email!, password!).subscribe({
      next: () => {
        // send the user back where they came from, or back home.
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        this.isSubmitting = false;
      }
    });
  }
}
