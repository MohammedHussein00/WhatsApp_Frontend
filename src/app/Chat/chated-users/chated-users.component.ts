import { Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { NewUserToChat, SelectedMessages, UserDto, SenderType } from '../../Service/interfaces';
import { ChatMessageDto, SignalRService, StatusType, ContentType, ReactDto } from '../../Service/signal-r.service';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { GlobalVariablesService } from '../GlobalVariableService/global-variables.service';
import { DialogModule } from 'primeng/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ButtonModule } from 'primeng/button';
import { PanelComponent } from '../panel/panel.component';
import { MenusService } from '../filter-new-chat-panel/menus.service';
import { FilterNewChatPanelComponent } from '../filter-new-chat-panel/filter-new-chat-panel.component';
import { UsersGroupsService } from './users-groups.service';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';

@Component({
  selector: 'app-chated-users',
  standalone: true,
  imports: [
    NgStyle,
    NgIf,
    HttpClientModule,
    NgFor,
    PanelComponent,
    MatButtonModule,
    AvatarModule,
    FormsModule,
    NgClass,
    ButtonModule,
    ReactiveFormsModule,
    DialogModule,
    FilterNewChatPanelComponent
  ],
  templateUrl: './chated-users.component.html',
  styleUrl: './chated-users.component.scss'
})
export class ChatedUsersComponent {




  users: UserDto[] = [];
  selectedUser: UserDto | null = null;
  selectedMessages: SelectedMessages[] = [];
  @ViewChild('conversationListContainer', { static: false }) conversationListContainer!: ElementRef;
  displayDialog: boolean = false;
  messages: ChatMessageDto[] = [];
  selectedTab: string = 'allUsers';
  searchKeyword: string = '';
  displayMenu: boolean = false;
  private recieveSound = new Audio('assets/recieve.mp3');
  private sendSound = new Audio('assets/send.mp3');
  isSender:boolean=false;
  isScrollend: boolean | null = true


  constructor(
    private renderer: Renderer2, // Inject Renderer2 here
    private http: HttpClient,
    public global: GlobalVariablesService,
    private signal: SignalRService,
    public usersGroups: UsersGroupsService
  ) {

    this.loadUserToChat = new FormGroup({
      email:new FormControl('', [Validators.required, Validators.email])
    });

    this.global.getSelectedMessages().subscribe((messages: SelectedMessages[]) => {
      this.selectedMessages = messages;
    });

    this.global.getUsers().subscribe((users: UserDto[]) => {
      this.users = users;
    });
    this.global.getMessages().subscribe((messages: ChatMessageDto[]) => {
      this.messages = messages;
    });
    this.global.getIsScrollend().subscribe((isScrollend: boolean|null) => {
      this.isScrollend = isScrollend;
    });

    this.global.setSelectedUser(this.selectedUser)
  }

  ngOnInit(): void {
    this.loadUserToChat.valueChanges.subscribe(() => {
      this.loadUsers()
    })
    document.addEventListener('click', this.onClick.bind(this));

    this.initializeSignalRConnection();
  }



  private initializeSignalRConnection(): void {
    this.signal.startConnection(localStorage.getItem('id')||'').subscribe(() => {
      this.setupMessageListener();
      this.loadInitialMessages();
      this.addDeliverMessagesListener();
      this.addReedMessagesListener();
      this.addReactListener();
    });
  }
  private loadInitialMessages(): void {
    const id = localStorage.getItem('id') || '';
    this.usersGroups.loadChat(id,this.http).subscribe(response => {
      this.messages = response;
      this.messages.forEach(message=>{
        if(message.senderId!==id&&(message.status!==2&&message.id!==3))
          message.status=1;
      })
      this.global.setMessages(response)
      this.updateUsersFromMessages();
    });
  }
  private setupMessageListener(): void {
    this.signal.addReceiveMessageListener((message: ChatMessageDto) => {
      this.usersGroups.loadChat(localStorage.getItem('id') || '',this.http).subscribe(response => {
        this.selectedMessages.push({
          id: message.id,
          content: message.content,
          imageUrl: message.senderId === this.selectedUser?.id ? this.selectedUser?.imageUrl || (localStorage.getItem('imgUrl')||'') : (localStorage.getItem('imgUrl')||''),
          name: message.senderId === this.selectedUser?.id ? this.selectedUser?.name || 'You' : 'You',
          time: message.time,
          senderType: message.senderId !== this.selectedUser?.id,
          senderId: message.senderId,
          receiverId: message.receiver?.id,
          contentType:message.contentType,
          status:message.status,
          reacts:message.reacts,
          replayMessageId:message.replayMessageId
        })
        this.messages.push(message)
        if(this.selectedUser?.id===message.senderId)
          {
            this.global.setSelectedMessages(this.selectedMessages);
            if(this.isScrollend)
            this.readMessages()
          }
        this.global.setMessages(this.messages);
        this.global.setUsers(this.users);
        this.updateUsersFromMessages()

      });

      setTimeout(() => this.usersGroups.scrollToBottom(this.conversationListContainer,this.renderer), 100);
      if(!this.isSender)
      this.recieveSound.play();
      else
      this.isSender=false

  });

  }


  private addReactListener(): void {
    this.signal.addReactListener((react: ReactDto) => {
      // Find the message by react.messageId in this.messages array
      this.messages.forEach((message) => {
        if (message.id === react.messageId) {
          // Check if the react already exists in this message's reacts array
          const existingReactIndex = message.reacts.findIndex(r => r.id === react.id);

          if (existingReactIndex !== -1) {
            // If react exists, update its react value
            message.reacts[existingReactIndex].react = react.react;
          } else {
            // If react does not exist, push the new react to the array
            message.reacts.push(react);
          }
        }
      });

      // Do the same for selectedMessages if needed
      this.selectedMessages.forEach((message) => {
        if (message.id === react.messageId) {
          // Check if the react already exists in this message's reacts array
          const existingReactIndex = message.reacts.findIndex(r => r.id === react.id);

          if (existingReactIndex !== -1) {
            // If react exists, update its react value
            message.reacts[existingReactIndex].react = react.react;
          } else {
            // If react does not exist, push the new react to the array
            message.reacts.push(react);
          }
        }
      });
    });

        this.global.setMessages(this.messages)
        this.global.setSelectedMessages(this.selectedMessages)


  }
  private addReedMessagesListener(): void {
    this.signal.addReedMessagesListener((ids: number[])=>{

      this.messages.forEach((message,index) => {
        ids.forEach(element => {
          if ( message.id === element)
            message.status=2;
        });
        });

        this.selectedMessages.forEach((message,index) => {
          ids.forEach(element => {
            if ( message.id === element)
              message.status=2;
          });
        });
      })
        this.global.setMessages(this.messages)
        this.global.setSelectedMessages(this.selectedMessages)


  }
  private addDeliverMessagesListener(): void {
    this.signal.addDeliverMessagesListener((userId:string)=>{
      this.messages.forEach(message => {
        if (message.receiver && message.receiver.id === userId)
          if(message.status!==2&&message.status!==1&&message.status!==3)
          message.status=1;
        });
        this.selectedMessages.forEach(message => {
          if (message.receiverId && message.receiverId === userId)
          if(message.status!==2&&message.status!==1&&message.status!==3)
            message.status=1;
          });
        });
        this.global.setMessages(this.messages)
        this.global.setSelectedMessages(this.selectedMessages)


  }
  private updateUsersFromMessages(): void {
    const currentUserId = localStorage.getItem('id') || '';

    // Use a Map to track users uniquely by their ID
    const userMap = new Map<string, UserDto>();

    this.messages.forEach(message => {
      if (message.receiver && message.receiver.id !== currentUserId) {
        if (!userMap.has(message.receiver.id)) {
          userMap.set(message.receiver.id, {
            id: message.receiver.id,
            name: message.receiver.name || '',
            content: message.content,
            time: new Date(message.time),
            status: message.status,
            imageUrl: message.receiver.image || ''
          });
        }
      }
    });

    // Merge new users into the existing users list without duplicates
    const existingUserIds = new Set(this.users.map(user => user.id));
    const newUsers = Array.from(userMap.values()).filter(user => !existingUserIds.has(user.id));

    this.users = [...this.users, ...newUsers];

    // Sort users by their last message time
    this.users.sort((a, b) => {
      const lastMessageA = this.messages
        .filter(m => m.receiver?.id === a.id || m.senderId === a.id)
        .sort((msg1, msg2) => new Date(msg2.time).getTime() - new Date(msg1.time).getTime())[0];

      const lastMessageB = this.messages
        .filter(m => m.receiver?.id === b.id || m.senderId === b.id)
        .sort((msg1, msg2) => new Date(msg2.time).getTime() - new Date(msg1.time).getTime())[0];

      const timeA = lastMessageA ? new Date(lastMessageA.time).getTime() : 0;
      const timeB = lastMessageB ? new Date(lastMessageB.time).getTime() : 0;

      return timeB - timeA; // Newest first
    });

    this.global.setUsers(this.users);
    // this.updateSelectedMessages();
  }


  readMessages() {

    this.signal.readMessages(localStorage.getItem('id') || '',this.selectedUser?.id||'').subscribe(response=>{
      this.messages.forEach(element => {

          if(element.senderId===this.selectedUser?.id)
          {
            element.status=2
          console.log(element)
          }
        });

      for(let i=0;i<response.length;i++){
        for(let j=0;j<this.selectedMessages.length;j++){
          if(this.selectedMessages[i].id===response[j])
            this.selectedMessages[i].status=2
        }
      }

        this.global.setMessages(this.messages)
        this.global.setSelectedMessages(this.selectedMessages)
      setTimeout(() => this.scrollToBottom(), 100);
    });

}

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    // Close the menu if clicking outside
    if (!targetElement.closest('.context-menu')) {
      this.usersGroups.hideContextMenu(this.displayMenu);
    }
  }
  updateSelectedMessages(): void {
    if (this.selectedUser) {
      this.selectedMessages = this.messages
        .filter(
          m =>
            m.receiver?.id === this.selectedUser?.id ||
            m.senderId === this.selectedUser?.id
        )
        .map(m => {
          const reacts = this.extractReacts(m); // Extract reacts separately
          return {
            id: m.id,
            content: m.content,
            imageUrl:
              m.senderId === this.selectedUser?.id
                ? this.selectedUser?.imageUrl || localStorage.getItem('imgUrl') || ''
                : localStorage.getItem('imgUrl') || '',
            name:
              m.senderId === this.selectedUser?.id
                ? this.selectedUser?.name || 'You'
                : 'You',
            time: m.time,
            senderType: m.senderId !== this.selectedUser?.id,
            senderId: m.senderId,
            receiverId: m.receiver?.id,
            contentType: m.contentType,
            status: m.status,
            reacts:this.messages.filter(s=>s.id===m.id)[0].reacts, // Assign reacts here
            replayMessageId: m.replayMessageId,
          };
        });
    }
    this.selectedMessages.forEach(m=>{
      console.log(this.messages)
      m.reacts=this.messages.filter(message=>message.id===m.id)[0].reacts
    })
    this.global.setSelectedMessages(this.selectedMessages);
    setTimeout(() => this.scrollToBottom(), 100); // Pass renderer here
  }

  // Separate function to extract reacts
  private extractReacts(message: ChatMessageDto): ReactDto[] {
    return message.reacts || []; // Return reacts or an empty array if undefined
  }



  switchTab(tabName: string) {
    this.selectedTab = tabName;
  }
  dialogShow() {
    this.displayDialog = true;
  }




  selectUser(user: UserDto) {
    if(this.selectedUser!==user){
    this.selectedUser = user;
    this.global.setSelectedUser(user);
    this.updateSelectedMessages();
    this.readMessages()
    this.scrollToBottom();
    }
  }

  scrollToBottom(): void {
    try {
      const conversationListContainer = this.conversationListContainer.nativeElement;
      this.renderer.setProperty(conversationListContainer, 'scrollTop', conversationListContainer.scrollHeight);
    } catch (err) {
    }
  }

  //#region new chat


  loadUserToChat!: FormGroup;
  userToCaht!: UserDto;
  testUser!: NewUserToChat
  notFoundUser: boolean = false




  loadUsers() {
    const emailValue = this.loadUserToChat.controls['email'].value || '';
    if (!emailValue || !this.loadUserToChat.controls['email'].valid) {
      this.notFoundUser = false;
      return;
    }

    this.http.get<NewUserToChat>(`${this.global.baseUrl}/User/get-user-to-chat?email=${emailValue}`).subscribe({
      next: (user: NewUserToChat) => {
        if (user) {
          this.userToCaht = {
            id: user.id,
            imageUrl: user.imgURL,
            name: user.name,
            content: user.id,
            status: StatusType.NotDelivered,
            time: new Date()
          };
        } else {
          this.notFoundUser = true;
        }
      },
      error: (err) => {
      }
    });
  }
  selectUserToChat(user: UserDto) {
    // Check if the user is already in the users array
    const userExists = this.users.some(u => u.id === user.id);

    // If the user is not in the array, add them
    if (!userExists) {
      this.users.push(user);
      this.selectedMessages=[]
      this.global.setSelectedMessages(this.selectedMessages);
    }

    // Set the selected user
    this.selectedUser = user;
    this.global.setSelectedUser(this.selectedUser)
    this.selectUser( user);

    this.displayDialog=false;
  }

  onEmailChange() {
    const emailValue = this.loadUserToChat.controls['email'].value;
    if (emailValue && this.loadUserToChat.controls['email'].valid) {
      this.loadUsers();
    }
  }
  //#endregion

//#region react chated user menu
  clickX: number = 0
  clickY: number = 0
  ReactWithThisUser(event: MouseEvent): void {
    event.preventDefault(); // Prevent the default context menu from showing
    this.clickX = event.clientX;
    this.clickY = event.clientY;

    this.setCustomPosition();
    this.usersGroups.toggleReactUserMenu(event); // Call your function
  }
  setCustomPosition() {
    document.documentElement.style.setProperty('--custom-left', `${this.clickX}px`);
    document.documentElement.style.setProperty('--custom-top', `${this.clickY}px`);
  }
//#endregion
isScrolledToEnd(): boolean {
  if (!this.conversationListContainer) return false; // Safety check

  const element = this.conversationListContainer.nativeElement as HTMLElement;
  return Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1;
}
}
