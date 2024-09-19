import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getName(): string | null {
    return localStorage.getItem('name');
  }

  getEmail(): string | null {
    return localStorage.getItem('email');
  }

  getRoles(): string[] {
    const roles: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('Role')) {
        const role = localStorage.getItem(key);
        if (role) {
          roles.push(role);
        }
      }
    }
    return roles;
  }

  getExpiredOn(): Date | null {
    const expiredOn = localStorage.getItem('ExpiredOn');
    if (expiredOn) {
      return new Date(expiredOn);
    }
    return null;
  }

  isAuthenticated(): boolean {
    const isAuthenticated = localStorage.getItem('IsAuthenticated');
    if (isAuthenticated==='true')
    return true;
    else
    return false;
  }
  GetImgUrl(): string {
    const img = localStorage.getItem('imgUrl');
    if (img)
    return img;
    else
    return '';
  }
}
