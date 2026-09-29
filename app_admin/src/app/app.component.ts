import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button'; 
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // dark mode state, persisted to localStorage so that it survives refreshes. 
  protected readonly isDarkMode = signal<boolean>(this.loadDarkModePreference());  

  constructor() {
    this.applyTheme();
  }
  
  toggleDarkMode(): void {
    const next = !this.isDarkMode();
    this.isDarkMode.set(next);
    localStorage.setItem('booklane-dark-mode', String(next));
    this.applyTheme();
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
  
  private loadDarkModePreference(): boolean {
    const stored = localStorage.getItem('booklane-dark-mode');
    if (stored !== null) {
      return stored === 'true';
    }
    // fall back to user's sys. preference.
    return window.matchMedia('(prefers-color-scheme: dark').matches;
  }

  private applyTheme(): void {
    document.documentElement.setAttribute(
      'data-theme',
      this.isDarkMode() ? 'dark' : 'light'
    );
  }
}

