import { Injectable, ViewChild } from '@angular/core';
import { Menu } from 'primeng/menu';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenusService {




  private toggleSortMenu = new Subject<Event>();
  toggleSortByMenu$ = this.toggleSortMenu.asObservable();
  togglesortMenu(event: Event) {
    this.toggleSortMenu.next(event);
  }




  private toggleNewGroup = new Subject<Event>();
  toggleNewGroupMenu$ = this.toggleNewGroup.asObservable();
  toggleNewGroupMenu(event: Event) {
    this.toggleNewGroup.next(event);
  }


  private toggleReactUser = new Subject<Event>();
  toggleReactUserMenu$ = this.toggleReactUser.asObservable();
  toggleReactUserMenu(event: Event) {
    this.toggleReactUser.next(event);
  }
}
