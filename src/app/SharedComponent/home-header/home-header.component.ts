import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { GlobalVariablesService } from '../../Service/global-variables.service';
import { AuthService } from '../../Service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule,RouterLinkActive],
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss']
})
export class HomeHeaderComponent {
  isFullScreen = false;
  data: any;
  night: any;
  token: string | null = '';
  name: string | null = '';
  email: string | null = '';
  roles: string[] | null = [];
  expiredOn!: Date | null;
  isAuthenticated: boolean | null = true;
  imgUrl: string = '';
  subscription!: Subscription;

  constructor(
    public global: GlobalVariablesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Fetch user-related data
    this.token = ''; // this.authService.getToken();
    this.name = ''; // this.authService.getName();
    this.email = ''; // this.authService.getEmail();
    this.roles = ['']; // this.authService.getRoles();
    this.expiredOn = new Date(); // this.authService.getExpiredOn();
    this.isAuthenticated = false; // this.authService.isAuthenticated();
    this.imgUrl = ''; // this.authService.GetImgUrl();

    // You can now use this data in your component
  }

  logout() {
    localStorage.clear();
    this.isAuthenticated = false;
    this.router.navigate(['/Home']);
  }

  isFixed: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isFixed = window.scrollY > 50; // Adjust threshold as needed
  }
}
