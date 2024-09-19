import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalVariablesService {
  night:boolean=false;
  private dataSource = new BehaviorSubject<boolean>(false); // Use any or define a specific type
  private Night = new BehaviorSubject<boolean>(false); // Use any or define a specific type
  currentData = this.dataSource.asObservable();
  currentNight = this.Night.asObservable();
  constructor() { }
  changeData(data: any) {
    this.dataSource.next(data);
  }
  convertNight(data: any) {
    this.Night.next(data);
  }
  baseUrl:string='https://localhost:7213'

}
