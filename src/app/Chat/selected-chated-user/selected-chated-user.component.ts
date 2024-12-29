import {  Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, SimpleChanges } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { NgIf, NgStyle } from '@angular/common';
import { GlobalVariablesService } from '../GlobalVariableService/global-variables.service';
import { UserDto } from '../../Service/interfaces';
import { HttpClient } from '@angular/common/http';

interface Tone {
    name: string;
    code: string;
}
@Component({
  selector: 'app-selected-chated-user',
  standalone: true,
  imports: [
    OverlayPanelModule,
    ButtonModule,
    DropdownModule,
    FormsModule,
    CardModule,
    MenuModule,
    DividerModule,
    InputTextModule,
    NgStyle,
    NgIf
  ],
  templateUrl: './selected-chated-user.component.html',
  styleUrls: ['./selected-chated-user.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class SelectedChatedUserComponent implements OnInit {


  searchOverlayPanel: boolean = false;
  tones: Tone[] | undefined;
  previousIndex: number = 1;
  spanElements: HTMLElement[] = [];
  selectedTone: Tone | undefined;
  selectedUserInfo!: SelectedUserInfo ;

  selectedUser: UserDto | null = null;
  constructor(private global:GlobalVariablesService,private http:HttpClient){
    this.global.getSelectedUser().subscribe(user=>{
      this.selectedUser=user;
    })
  }
  ngOnInit() {
    this.tones = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];

}






setActive(span: string, event: Event) {
  const clickedElement = event.currentTarget as HTMLElement;
  this.spanElements = Array.from(document.querySelectorAll('.listItem')) as HTMLElement[];

  const clickedIndex = this.spanElements.indexOf(clickedElement);
  var isMovingDown=false;
  if(span=="Overview"&&this.previousIndex>1)
   isMovingDown = true;
  else if(span=="Media"&&this.previousIndex>2)
   isMovingDown = true;
  else if(span=="Files"&&this.previousIndex>3)
   isMovingDown = true;
  else if(span=="Links"&&this.previousIndex>4)
   isMovingDown = true;
  else if(span=="Encryption"&&this.previousIndex>5)
   isMovingDown = true;
  else if(span=="Groups"&&this.previousIndex>=6)
   isMovingDown = true;
  else
  {
  isMovingDown=false
  }

  if(span=="Overview")
    {
      this.previousIndex = 1;
    }
    else if(span=="Media")
      this.previousIndex = 2;
    else if(span=="Files")
      this.previousIndex = 3;
    else if(span=="Links")
      this.previousIndex = 4;
    else if(span=="Encryption")
      this.previousIndex = 5;
    else if(span=="Groups")
      this.previousIndex = 6;

  this.moveLine(clickedElement, isMovingDown);

}

moveLine(clickedElement: HTMLElement, isMovingDown: boolean) {
  const line = clickedElement.querySelector('.active-line') as HTMLElement;

  // Immediately hide the clicked element's line if it exists
  if (line) {
    line.style.height = '0'; // Hide the current line immediately
  }

  // Logic to determine if we are moving up or down
  if (isMovingDown) {
    // Move from bottom to top
    if (line) {
      line.style.bottom = '3px';
      line.style.top = 'auto'; // Reset top
      setTimeout(() => {
        line.style.height = '80%'; // Grow the line upwards
      }, 10); // Small delay for the transition effect
    }
  } else {
    // Move from top to bottom
    if (line) {
      line.style.top = '3px';
      line.style.bottom = 'auto'; // Reset bottom
      setTimeout(() => {
        line.style.height = '80%'; // Grow the line downwards
      }, 10);
    }
  }

  // Immediately hide the previous active line if it exists
  this.spanElements.forEach(li => {
    if (li !== clickedElement) {
      const otherLine = li.querySelector('.active-line') as HTMLElement;
      if (otherLine) {
        otherLine.style.height = '0'; // Collapse the other lines instantly
      }
    }
  });
}

  getSelectedUserInfo(userId:string){
    this.http.get<any>(`${this.global.baseUrl}/User/laod-selected-user-info?id=${userId}`).subscribe(response=>{
      this.selectedUserInfo=response;
    })
  }
}
export interface SelectedUserInfo{
  about:string;
  userName:string;
}



