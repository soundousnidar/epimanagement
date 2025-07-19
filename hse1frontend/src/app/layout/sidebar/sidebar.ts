import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarService } from '../../core/services/sidebar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit, OnDestroy {
  isOpen = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private sidebarService: SidebarService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscription = this.sidebarService.isOpen$.subscribe(
      isOpen => this.isOpen = isOpen
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  closeSidebar() {
    this.sidebarService.close();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.closeSidebar();
  }
}
