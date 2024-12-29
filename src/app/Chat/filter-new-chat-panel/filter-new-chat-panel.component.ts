import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { MenusService } from './menus.service';
import {  OverlayPanelModule } from 'primeng/overlaypanel'; // Import OverlayPanel
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { UsersGroupsService } from '../chated-users/users-groups.service';
import {  CheckboxModule } from 'primeng/checkbox';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChipsModule } from 'primeng/chips';
import { UserDto } from '../../Service/interfaces';
import { GlobalVariablesService } from '../GlobalVariableService/global-variables.service';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-filter-new-chat-panel',
  standalone: true,
  imports: [MenuModule, ButtonModule,
    OverlayPanelModule,StyleClassModule,
    NgFor,
    NgClass,
    NgStyle,
    NgIf,
    CheckboxModule,
    FormsModule,
    ChipsModule,
    ReactiveFormsModule,
    FileUploadModule
  ],
  templateUrl: './filter-new-chat-panel.component.html',
  styleUrl: './filter-new-chat-panel.component.scss'
})
export class FilterNewChatPanelComponent implements OnInit{
  newGroupIsOpen:boolean=false;
  newGroupIsOpenLastStep:boolean=false;
  @ViewChild('sortMenu') sortMenu!: Menu;
  @ViewChild('newGroup') newGroup!: Menu;
  @ViewChild('reactUserMenu') reactUserMenu!: Menu;

  users: UserDto[] = [];
  values = new FormControl<string[] | null>(null);
  isMemberAddedToNewGroup = new Array(this.users.length).fill(false);

  newGroupDto:GroupDto={
    id:0,
    AdminId:'',
    goupIcon:new File([], 'dummy.png'),
    groupName:'',
    groupCaption:'',
    groupMembers:[]
  };

  constructor(public global:GlobalVariablesService, private menuService: MenusService,    public usersGroups: UsersGroupsService  ) {
    // Subscribe to the toggle event and open/close the menu
    this.menuService.toggleSortByMenu$.subscribe((event: Event) => {
      this.sortMenu.toggle(event);
    });
    this.menuService.toggleNewGroupMenu$.subscribe((event: Event) => {
      this.newGroup.toggle(event);
    });
    this.menuService.toggleReactUserMenu$.subscribe((event: Event) => {
      this.reactUserMenu.toggle(event);
    });

    this.global.getUsers().subscribe((users: UserDto[]) => {
      this.users = users;
    });

  }


  onInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value.trim();

    // Print the input value as the user types
    console.log('User is typing:', inputValue);
  }
  onChipRemoved(event: any) {
    const removedValue = event.value;
    const index = this.users.findIndex(user => user.name === removedValue);
    if (index !== -1) {
      this.isMemberAddedToNewGroup[index] = false;
      this.newGroupDto.groupMembers = this.newGroupDto.groupMembers.filter(id => id !== this.users[index].id);

    }
  }

  onEnter(event: KeyboardEvent) {
    // Check if the number of chips is more than 2 when Enter is pressed
    if (this.values.value&&this.values.value.length >= 2) {
      event.preventDefault();  // Prevent adding more than 2 items
      console.log('Max items reached. You cannot add more than 2.');
    } else {
      console.log('Enter key pressed. Current chips:', this.values.value);
    }
  }



  sortByItems: MenuItem[] | undefined;
  newGroupItems: MenuItem[] | undefined;
  frequentlyContacted = [
    { name: 'Mohamed El Agamy', status: "I'm Burdened With Glorious Purpose", image: 'assets/profile1.png' },
    { name: '+20 106 360 1696', status: 'لونا الناس كما استمتعوا...', image: 'assets/profile1.png' },
    { name: 'MOHAMMED AHMED', status: 'كلماتك قاسية جداً...', image: 'assets/profile1.png' },
    { name: 'محمد ياسر', status: 'أول مرة احس اني عكيت جامد', image: 'assets/profile1.png' }
  ];

  allContacts = [
    { number: '+201126658391', status: 'خبر القلوب اختها🤍🤍',image: 'assets/profile1.png' },
    { number: '+201214236096', status: '' ,image: 'assets/profile1.png'}
  ];
  ngOnInit() {
      this.sortByItems = [
          {
              label: 'Filter chats by',
              items: [
                  {
                      label: 'Unreaded chats',
                      icon: 'iconoir-chat-lines test'
                  },
                  {
                      label: 'Contacts',
                      icon: 'pi pi-user'
                  },
                  {
                      label: 'Non-Contacts',
                      icon: 'pi pi-user test'
                  },
                  {
                      label: 'Groups',
                      icon: 'pi pi-users'
                  },
                  {
                      label: 'Drafts',
                      icon: 'pi pi-pencil'
                  }
              ]
          }
      ];
      this.newGroupItems=[
        {
          label:'',
          items:[

          ]
        }
      ]


      this.newGroupDto.AdminId=localStorage.getItem('id')||''
      this.isMemberAddedToNewGroup = new Array(this.users.length).fill(false);

  }

  onCheckboxChange(memberId: string, isChecked: boolean, i: number) {
      this.isMemberAddedToNewGroup[i] = isChecked;
      if(isChecked){
      this.values.setValue([...(this.values.value || []), this.users.filter(u=>u.id==memberId)[0].name]);
    this.newGroupDto.groupMembers.push(memberId);
    }
    else{
      this.removeValue(this.users.filter(u=>u.id==memberId)[0].name)
      this.newGroupDto.groupMembers = this.newGroupDto.groupMembers.filter(id => id !== memberId);

    }
    }

    removeValue(removeValue: string) {
      const currentValue = this.values.value || [];
      const newValue = currentValue.filter((value) => value !== removeValue);
      this.values.patchValue(newValue);
    }


}
export interface GroupDto{
  id:number;
  groupName:string;
  groupCaption:string;
  goupIcon:File;
  AdminId:string;
  groupMembers:string[];

}
