import { Component, Renderer2 } from '@angular/core';
import { ChatedUsersComponent } from '../chated-users/chated-users.component';
import { MessagesComponent } from '../messages/messages.component';
import { HttpClientModule } from '@angular/common/http';
import { ChatControlsComponent } from '../chat-controls/chat-controls.component';
import { SelectedMessages, UserDto } from '../../Service/interfaces';
import { GlobalVariablesService } from '../GlobalVariableService/global-variables.service';
import { ChatMessageDto } from '../../Service/signal-r.service';
import { MessagesService } from '../messages/messages.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [
    ChatedUsersComponent,
    HttpClientModule,
    MessagesComponent,
    ChatControlsComponent,
    NgIf
  ],
  templateUrl: './chat-layout.component.html',
  styleUrl: './chat-layout.component.scss'
})
export class ChatLayoutComponent {
  selectedUser: UserDto | null = null;
  displayMenu:boolean=false;
  reactMessageId:number=0;
  selectedMessages: SelectedMessages[] = [];
  messages: ChatMessageDto[] = [];
  constructor(private renderer:Renderer2,private global:GlobalVariablesService,public messagesService:MessagesService){

    this.global.getSelectedUser().subscribe((user: UserDto|null) => {
      this.selectedUser = user;
    });

    this.global.getMessages().subscribe((messages:ChatMessageDto[]) => {
      this.messages = messages;
    });
    this.global.getSelectedMessages().subscribe((messages:SelectedMessages[]) => {
      this.selectedMessages = messages;
    });
  }
}
