import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoaderService } from './loader.service';

@Injectable()
export class InterCeptorInterceptor implements HttpInterceptor {

  constructor(public loader:LoaderService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
   this.loader.isLoading.next(true);
    const localstorage=localStorage.getItem('token');
    request=request.clone({
      setHeaders:{Authorization:"Bearer "+localstorage }
    });
    return next.handle(request).pipe(finalize(
      ()=>{
        this.loader.isLoading.next(false);
      }
    ));
  }
}
