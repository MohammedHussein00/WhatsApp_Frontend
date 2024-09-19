import { Component } from '@angular/core';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { LoaderService } from '../../Service/loader.service';
import { GlobalVariablesService } from '../../Service/global-variables.service';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterLink, RouterModule,RouterLinkActive], // Ensure HttpClientModule is imported here
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  login: FormGroup;
  Message: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private global: GlobalVariablesService,
    public loader: LoaderService
  ) {
    this.login = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[#$^+=!*()@%&]).{8,}$')])
    });
  }

  ngOnInit(): void {}

  loginNewAccount() {
    if (this.login.valid) {
      this.Login(this.login).subscribe({
        next: (response: any) => {
          if (response.message === '' || response.message === null) {
            localStorage.clear();
            localStorage.setItem('token', response.token);
            localStorage.setItem('imgUrl', response.imgUrl);
            localStorage.setItem('name', response.name);
            localStorage.setItem('email', response.email);
            localStorage.setItem('ExpiredOn', response.expiredOn !== undefined && response.expiredOn !== null ? response.expiredOn.toString() : '');
            localStorage.setItem('IsAuthenticated', response.isAuthenticated !== undefined && response.isAuthenticated !== null ? response.isAuthenticated.toString() : '');
            localStorage.setItem('Role', response.roles !== undefined && response.roles !== null ? response.roles.toString() : '');
            if (response.roles[0] === 'User' || response.roles[0] === 'Agent')
              this.router.navigate(['/Home']);
            else if (response.roles[0] === 'Admin' || response.roles[0] === 'SuberAdmin')
              this.router.navigate(['/dash/agencies']);
          } else {
            this.Message = response.message;
          }
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.error && typeof errorResponse.error === 'string') {
            this.Message = errorResponse.error; // Display error message
            console.log(this.Message);
          } else {
            console.error('Unexpected error:', errorResponse);
          }
        }
      });
    }
  }

  Login(x: FormGroup): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${this.global.baseUrl}/api/Auth/login`, x.value,{ headers });
  }

  lengthValidator(length: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }
      return value.toString().length !== length ? { 'lengthError': { value: value } } : null;
    };
  }

  showPassword = false;
  showConfirmPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
