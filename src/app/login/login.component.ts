import { Component } from '@angular/core';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { GlobalVariablesService } from '../Chat/GlobalVariableService/global-variables.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { StepsModule } from 'primeng/steps';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { InputOtpModule } from 'primeng/inputotp';
import { StyleClassModule } from 'primeng/styleclass';
import { MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { response } from 'express';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterLink, RouterModule, RouterLinkActive,
    StepsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    InputOtpModule,
    StyleClassModule,
    FileUploadModule, ToastModule, CommonModule
  ],
  providers: [MessageService],

  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  items: MenuItem[] = [];
  activeIndex: number = 0;

  emailForm: FormGroup;
  verificationForm: FormGroup;
  profileForm: FormGroup;
  showIncorrectverificationCodeMessage: boolean = false;
  recievedCode: string = ''


  constructor(private formBuilder: FormBuilder, private messageService: MessageService, private http: HttpClient, private global: GlobalVariablesService,private router:Router) {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.verificationForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });

    this.profileForm = this.formBuilder.group({
      name: [''],
      about: [''],
    });
  }

  ngOnInit() {
    this.items = [
      { label: 'Welcome', command: () => this.activeIndex = 0 },
      { label: 'Enter Email', command: () => this.activeIndex = 1 },
      { label: 'Verify Code', command: () => this.activeIndex = 2 },
      { label: 'Profile Info', command: () => this.activeIndex = 3 },
    ];
  }

  onNext() {
    if (this.activeIndex < 3) {
      this.activeIndex++;
    }
    else
    this.router.navigate(['/chat']);
  }

  onBack() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }


  //#region Verification code
  onEmailVerificationSubmit() {
    if (this.emailForm.valid) {
      this.onNext();
      this.VerifyEmail(this.emailForm.controls['email'].value).subscribe(response => {
        this.recievedCode = response.data
      })
    }
  }

  VerifyEmail(email: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const encodedEmail = encodeURIComponent(email);

    return this.http.post<any>(`${this.global.baseUrl}/api/Auth/verify?email=${encodedEmail}`, {}, { headers });
  }


  checkCorrectCode(): boolean {
    const inputCode = this.verificationForm.controls['code'].value;
    const receivedCode = this.recievedCode.toString(); // Ensure received code is a string


    if (inputCode.toString() === receivedCode) {
      return true;
    } else {
      return false;
    }
  }

  onVerificationSubmit() {

    if (this.checkCorrectCode()) {
      this.loadUserDataIfRegisterBefor()
      this.onNext();
    }
    else
      this.showIncorrectverificationCodeMessage = true
  }
  //#endregion




  onProfileSubmit() {
      let formdata = new FormData();
      formdata.append('name', this.profileForm.controls['name'].value)
      formdata.append('email', this.emailForm.controls['email'].value)
      formdata.append('about', this.profileForm.controls['about'].value)
      if(!this.profileImageFile&&(this.base64===''||this.base64===null))
        formdata.append('imageChanged', 'true')

      if (this.profileImageFile)
        formdata.append('image', this.profileImageFile)
      this.Regsiter(formdata).subscribe(response => {
        if (response.message === '' || response.message === null) {
          localStorage.clear();
          localStorage.setItem('token', response.token);
          localStorage.setItem('imgUrl', response.imgUrl);
          localStorage.setItem('EmailConfirmed', response.EmailConfirmed);
          localStorage.setItem('name', response.name);
          localStorage.setItem('id', response.id);
          localStorage.setItem('email', response.email);
          localStorage.setItem('ExpiredOn', response.expiredOn ? response.expiredOn.toString() : '');
          localStorage.setItem('IsAuthenticated', response.isAuthenticated ? response.isAuthenticated.toString() : '');

          this.router.navigate(['/chat']);
        }
      })
  }

  loadUserDataIfRegisterBefor() {
    this.http.post<any>(`${this.global.baseUrl}/api/Auth/load?email=${encodeURIComponent(this.emailForm.
      controls['email'].value
    )}`, {}).subscribe(response => {
      this.profileForm.controls['name'].setValue(response.name)
      this.profileForm.controls['about'].setValue(response.about)
      if (response.imageURL) {

          this.base64 = response.imageURL;

      }
    })
  }
  Regsiter(form: FormData): Observable<any> {


    return this.http.post<any>(`${this.global.baseUrl}/api/Auth/register`, form);
  }

  uploadedFiles: any[] = [];
  profileImage: string | ArrayBuffer | null = null;
  profileImageFile: File | null = null;


  base64: string | undefined = ''
  onchange(event: any) {
    if (event.target.files[0].type != "application/pdf") {

      const file = event.target.files[0];
      this.profileImageFile = file
      let reader1 = new FileReader();
      reader1.readAsDataURL(file);
      reader1.onload = () => {
        this.base64 = reader1.result?.toString();


      }
    }



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
