import { Component, OnInit } from '@angular/core';
import {  FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { RouterLink } from '@angular/router';
import { InputNumberModule } from 'primeng/inputnumber';
import { GlobalVariablesService } from '../../Service/global-variables.service';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
interface City {
  name: string;
  id: number;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    InputNumberModule,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    CalendarModule,
    FormsModule,
    CheckboxModule,
    DropdownModule,
    DividerModule,
    RouterLink,
    HttpClientModule,
    NgIf
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  submitForm!: FormGroup;
  Message:string=''


  constructor(private http:HttpClient,private global:GlobalVariablesService,private router:Router) {
    this.registerForm = new FormGroup({
      name: new FormControl('',[ Validators.required,Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8),Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[#$^+=!*()@%&]).{8,}$')]),
    });
  }

  ngOnInit() {


  
  }
  onSubmit() {
    if (this.registerForm.valid) {
        const formData = {
            name: this.registerForm.get('name')?.value,
            email: this.registerForm.get('email')?.value,
            password: this.registerForm.get('password')?.value,
        };

        console.log(formData);

        this.registerStudent(formData).subscribe({
            next: (response: any) => {
                if (response.message === '' || response.message === null) {
                    localStorage.clear();
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('name', response.name);
                    localStorage.setItem('id', response.id);
                    localStorage.setItem('email', response.email);
                    localStorage.setItem('ExpiredOn', response.expiredOn ? response.expiredOn.toString() : '');
                    localStorage.setItem('IsAuthenticated', response.isAuthenticated ? response.isAuthenticated.toString() : '');

                    this.router.navigate(['/en-chat']);
                } else {
                    this.Message = response.message;
                }
            },
            error: (errorResponse: HttpErrorResponse) => {
                if (errorResponse.error && typeof errorResponse.error === 'string') {
                    this.Message = errorResponse.error;
                } else {
                    console.error('Unexpected error:', errorResponse);
                }
            }
        });
    } else {
        this.registerForm.markAllAsTouched();
    }
}

registerStudent(studentData: any): Observable<SignUp> {
    const headers = new HttpHeaders({
        'Content-Type': 'application/json'
    });

    return this.http.post<SignUp>(`${this.global.baseUrl}/api/Auth/register-student`, studentData, { headers });
}


}
export interface SignUp {
  message:string;
  name:string;
  id:string;
  email:string;
  roles:string[];
  token:string;
  expiredOn:Date;
  isAuthenticated:boolean;
}
