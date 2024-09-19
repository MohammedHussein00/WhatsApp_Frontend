// src/app/page-visit-tracker.service.ts
import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PageVisitTrackerService {

  constructor(private router: Router) {
    // Subscribe to navigation events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      console.log('Navigation ended to', event.urlAfterRedirects);
      // Here you can add logic that needs to run on NavigationEnd
    });
  }


  private trackPageVisits(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const currentPage = event.urlAfterRedirects;
      this.incrementPageVisit(currentPage);
    });
  }

  private incrementPageVisit(pageUrl: string): void {
    const visits = localStorage.getItem(pageUrl) || '0';
    const visitCount = parseInt(visits, 10) + 1;
    localStorage.setItem(pageUrl, visitCount.toString());
  }
}
