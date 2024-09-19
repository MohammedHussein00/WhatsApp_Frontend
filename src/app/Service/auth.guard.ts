import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (localStorage.getItem('Role') === 'SuberAdmin') { // Fixed 'Pateint' typo
        return true;
      } else {
        // Redirect to a specific route or return UrlTree to navigate to a specific route
        return this.router.parseUrl('/login');
        // Alternatively, you can use:
        // this.router.navigateByUrl('/unauthorized');
        // return false; // if you prefer to return false to deny access without redirecting
      }
  }
}
