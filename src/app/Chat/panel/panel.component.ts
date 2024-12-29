import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { GlobalVariablesService } from '../GlobalVariableService/global-variables.service';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [
    ButtonModule,
    SidebarModule,
    AvatarModule,
    NgIf,
    DividerModule,
    NgStyle,
    NgFor,
    OverlayPanelModule,
    NgClass
  ],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class PanelComponent implements OnInit  {


  sidebarVisible: boolean = false;

  members = [
    { name: 'Amy Elsner', image: 'amyelsner.png', email: 'amy@email.com', role: 'Owner' },
    { name: 'Bernardo Dominic', image: 'bernardodominic.png', email: 'bernardo@email.com', role: 'Editor' },
    { name: 'Ioni Bowcher', image: 'ionibowcher.png', email: 'ioni@email.com', role: 'Viewer' }
];


previousIndex: number = 1;
spanElements: HTMLElement[] = [];
constructor(public global:GlobalVariablesService){

}
ngOnInit() {
  // Get all span elements and convert NodeListOf<Element> to array of HTMLElements
  this.spanElements = Array.from(document.querySelectorAll('.icon-content')) as HTMLElement[];
  this.global.loadCurrentUserDataFromLocalStorage()

}

setActive(span: string, event: Event) {
  const clickedElement = event.currentTarget as HTMLElement;
  const clickedIndex = this.spanElements.indexOf(clickedElement);
  var isMovingDown=false;
  if(span==="chats"&&this.previousIndex>1)
   isMovingDown = true;
  else if(span==="calls"&&this.previousIndex>2)
   isMovingDown = true;
  else if(span=="updates"&&this.previousIndex>3)
   isMovingDown = true;
  else if(span=="Started"&&this.previousIndex>4)
   isMovingDown = true;
  else if(span=="archived"&&this.previousIndex>=5)
   isMovingDown = true;
  else
  {
  isMovingDown=false
  }

  if(span==="chats")
    {
      this.previousIndex = 1;
    }
    else if(span=="calls")
      this.previousIndex = 2;
    else if(span=="updates")
      this.previousIndex = 3;
    else if(span=="Started")
      this.previousIndex = 4;
    else if(span=="archived")
      this.previousIndex = 5;

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
  this.spanElements.forEach(span => {
    if (span !== clickedElement) {
      const otherLine = span.querySelector('.active-line') as HTMLElement;
      if (otherLine) {
        otherLine.style.height = '0'; // Collapse the other lines instantly
      }
    }
  });
}



}
