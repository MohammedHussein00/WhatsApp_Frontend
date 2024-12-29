import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SelectedMessages } from '../SharedComponent/private-chat/interfaces';

@Injectable({
  providedIn: 'root'
})
export class GlobalVariablesService {
  night:boolean=false;
  private dataSource = new BehaviorSubject<boolean>(false); // Use any or define a specific type
  private Night = new BehaviorSubject<boolean>(false); // Use any or define a specific type
  currentData = this.dataSource.asObservable();
  currentNight = this.Night.asObservable();



   selectedMessagesSource = new BehaviorSubject<SelectedMessages[]>([]);
  
  // Observable to allow subscription
  selectedMessages$ = this.selectedMessagesSource.asObservable();
  constructor() { }
  changeData(data: any) {
    this.dataSource.next(data);
  }
  convertNight(data: any) {
    this.Night.next(data);
  }
  baseUrl:string='https://localhost:7213'



  setSelectedMessages(messages: SelectedMessages[]) {
    this.selectedMessagesSource.next(messages);
  }

  // Method to get the current value of selected messages
  getSelectedMessages(): SelectedMessages[] {
    return this.selectedMessagesSource.value;
  }
}
