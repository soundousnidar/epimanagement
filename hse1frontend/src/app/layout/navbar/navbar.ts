import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  constructor(
    private sidebarService: SidebarService,
    private router: Router
  ) {}

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  logout() {
    // Clear token from localStorage
    localStorage.removeItem('token');
    // Navigate to login page
    this.router.navigate(['/login']);
  }
}
