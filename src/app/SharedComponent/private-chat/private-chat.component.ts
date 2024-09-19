import { AfterViewInit, Component, ElementRef, OnInit,OnDestroy, Renderer2, ViewChild, HostListener, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatService } from './chat.service';
import { CommonModule, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { from, Observable } from 'rxjs';
import { GlobalVariablesService } from '../../Service/global-variables.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { InputIconModule } from 'primeng/inputicon';
import * as signalR from '@microsoft/signalr';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { ChatMessageDto, SignalRService, StatusType } from '../../Service/signal-r.service';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { PickerModule } from '@ctrl/ngx-emoji-mart'; // Import PickerModule
import { SelectedMessages, SendMessage, User, UserDto,NewUserToChat} from './interfaces'; // Import PickerModule
import { DialogModule } from 'primeng/dialog';
import { City } from '../../Service/interfaces';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';


@Component({
  selector: 'app-private-chat',
  standalone: true,
  imports: [
    InputNumberModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule,
    FileUploadModule,
    NgFor,
    NgIf,
    DialogModule,
    NgClass,
    CardModule,
    NgStyle,
    InputIconModule,
    CommonModule,
    AvatarModule,
    HttpClientModule,
    ButtonModule,
    MenuModule,
    MatButtonModule,
     MatMenuModule,
      MatIconModule,
      PickerModule

  ],

  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.scss']
})
export class PrivateChatComponent implements OnInit  {
  items: MenuItem[] | undefined;
  private recieveSound = new Audio('assets/recieve.mp3');
  private sendSound = new Audio('assets/send.mp3');

  @ViewChild('menu1') menu1: any;
  @ViewChild('conversationListContainer', { static: false }) conversationListContainer!: ElementRef;
  @ViewChild('audioContainer', { static: true }) audioContainer!: ElementRef;

  allUsers: User[] = [
    { id: 1, name: 'Brandon Smith', messages: [], unreadMessagesCount: 0 },
    { id: 2, name: 'Shreyu N', messages: [], unreadMessagesCount: 0 },
    // Add more users as needed
  ];

  selectedTab: string = 'allUsers';
  searchKeyword: string = '';

  selectedUser: UserDto | null = null;
  messageForm: FormGroup;
  messages: ChatMessageDto[] = [];
  SendMessage!: SendMessage;
  displayMenu: boolean = false;

  users: UserDto[] = [];
  selectedMessages: SelectedMessages[] = [];
  isSender:boolean=false;
  customMenuClass: string = 'custom-menu';

  constructor(private http: HttpClient, private global: GlobalVariablesService,
    private elementRef: ElementRef,
    public chat:ChatService,
    private formBuilder: FormBuilder, private renderer: Renderer2, private signal: SignalRService) {
    this.messageForm = this.formBuilder.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserToChat = new FormGroup({
      phone: new FormControl('')
    });
    this.loadUserToChat.valueChanges.subscribe(()=>{
      this.loadUsers()
        })
    document.addEventListener('click', this.onClick.bind(this));

    this.items = [
      { label: 'Option 1' },
      { label: 'Option 2' },
      { label: 'Option 3' }
    ];

    this.initializeSignalRConnection();
  }

  private initializeSignalRConnection(): void {
    this.signal.startConnection().subscribe(() => {
      console.log('SignalR connection established.');
      this.setupMessageListener();
      this.loadInitialMessages();
    });
  }

  private setupMessageListener(): void {
    this.signal.addReceiveMessageListener((messages: ChatMessageDto[]) => {
      console.log('Received messages:', messages);
      this.loadChat(localStorage.getItem('email') || '').subscribe(response => {
        this.messages = response;
        this.updateUsersFromMessages();
      });
      if(this.selectedUser)
      this.selectUser( this.selectedUser) ;
      setTimeout(() => this.scrollToBottom(), 100);
      if(!this.isSender)
      this.recieveSound.play();
      else
      this.isSender=false

    });
  }

  private updateUsersFromMessages(): void {
    const currentUserId = localStorage.getItem('id') || '';

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

      if (message.senderId && message.senderId !== currentUserId) {
        if (!userMap.has(message.senderId)) {
          userMap.set(message.senderId, {
            id: message.senderId,
            name: message.receiver.name || '',
            content: message.content,
            time: new Date(message.time),
            status: message.status,
            imageUrl: message.receiver.image || ''
          });
        }
      }
    });

    this.users = Array.from(userMap.values());
    this.updateSelectedMessages();
  }

  updateSelectedMessages(): void {
    if (this.selectedUser) {
      this.selectedMessages = this.messages
        .filter(m => m.receiver?.id === this.selectedUser?.id || m.senderId === this.selectedUser?.id)
        .map(m => ({
          content: m.content,
          imageUrl: m.senderId === this.selectedUser?.id ? this.selectedUser?.imageUrl || '' : '',
          name: m.senderId === this.selectedUser?.id ? this.selectedUser?.name || '' : '',
          time: m.time,
          senderType: m.senderId !== this.selectedUser?.id,
          senderId: m.senderId,
          receiverId: m.receiver?.id
        }));
    }
    setTimeout(() => this.scrollToBottom(), 100);

  }

  private loadInitialMessages(): void {
    const email = localStorage.getItem('email') || '';
    this.loadChat(email).subscribe(response => {
      this.messages = response;
      this.updateUsersFromMessages();
    });
  }

  send(x: FormData): Observable<any> {
    return this.http.post<any>(`${this.global.baseUrl}/Student/send-message`, x);
  }

  loadChat(email: string): Observable<ChatMessageDto[]> {
    return this.http.get<ChatMessageDto[]>(`${this.global.baseUrl}/Student/laod-chat?email=${email}`);
  }

  switchTab(tabName: string) {
    this.selectedTab = tabName;
  }

  selectUser(user: UserDto) {
    this.selectedUser = user;
    this.updateSelectedMessages();
    this.scrollToBottom();
  }

  isCurrentUser(senderId: string): boolean {
    return this.selectedUser?.id === senderId;
  }

  getLastMessage(user: UserDto): string {
    const userMessages = this.messages.filter(m => m.receiver?.id === user.id || m.senderId === user.id);
    if (userMessages.length > 0) {
      const lastMessage = userMessages[userMessages.length - 1];
      return lastMessage.content || '';
    }
    return '';
  }

  getLastMessageTime(user: UserDto): string {
    const userMessages = this.messages.filter(m => m.receiver?.id === user.id || m.senderId === user.id);
    if (userMessages.length > 0) {
      const lastMessage = userMessages[userMessages.length - 1];
      const messageTime = new Date(lastMessage.time);

      const today = new Date();
      const messageDate = new Date(messageTime);

      if (messageDate.toDateString() === today.toDateString()) {
        return this.formatTime(messageDate);
      }

      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (messageDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }

      const startOfWeek = new Date(today);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      if (messageDate >= startOfWeek && messageDate <= endOfWeek) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[messageDate.getDay()];
        return dayName;
      }

      return this.formatDate(messageDate);
    }
    return '';
  }

  private formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  sendMessage() {
    if (this.messageForm.valid||this.audioBlob) {
      const email = localStorage.getItem('email');
      const form = new FormData();
      form.append('content', this.messageForm.controls['content'].value);
      form.append('messageType', '0');
      if(this.audioBlob)
      form.append('file', this.audioBlob,'record.mp3');

      form.append('senderEmail', email || '');
      form.append('receiverId', this.selectedUser?.id || '');

      this.send(form).subscribe(() => {
        this.messageForm.reset();
        this.sendSound.play()
        this.isSender=true
        this.signal.startConnection().subscribe(() => {
          console.log('SignalR connection established.');
          this.signal.addReceiveMessageListener((messages: ChatMessageDto[]) => {
            console.log('Received messages:', messages);
            this.messages = messages;
            this.updateUsersFromMessages();
            this.updateSelectedMessages();
            setTimeout(() => this.scrollToBottom(), 100);
          });
          this.signal.sendMessage(email || '').subscribe();
        });
      });
    }
  }

  get allUsersFiltered(): User[] {
    if (this.searchKeyword.trim() !== '') {
      const keyword = this.searchKeyword.toLowerCase();
      return this.allUsers.filter(user => user.name.toLowerCase().includes(keyword));
    }
    return this.allUsers;
  }

  countUnread(user: UserDto): number {
    const userMessages = this.messages.filter(m => m.receiver?.id === user.id && !m.status);
    return userMessages.length;
  }

  scrollToBottom(): void {
    try {
      const conversationListContainer = this.conversationListContainer.nativeElement;
      this.renderer.setProperty(conversationListContainer, 'scrollTop', conversationListContainer.scrollHeight);
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }


// #region
  mediaRecorder: any;
  chunks: any[] = [];
  audioURL: string | null = null;
  isRecording = false;
  elapsedTime = '00:00';
  intervalId: any;
  audioBlob:any
  samples = Array(20).fill({ height: '10px' });

  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();
      this.isRecording = true;
      this.startTimer();
      this.animateSamples();
      this.mediaRecorder.ondataavailable = (event: any) => {
        this.chunks.push(event.data);
      };
      this.mediaRecorder.onstop = () => {
        this.audioBlob = new Blob(this.chunks, { type: 'audio/mp3' });
        this.chunks = [];
        this.audioURL = URL.createObjectURL(this.audioBlob);
        this.appendAudioElement(this.audioURL);
        this.stopTimer();
      };
    });
  }

  stopRecording() {
    this.mediaRecorder.stop();
    this.isRecording = false;
  }

  startTimer() {
    let seconds = 0;
    this.intervalId = setInterval(() => {
      seconds++;
      this.elapsedTime = new Date(seconds * 1000).toISOString().substr(14, 5);
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.intervalId);
    this.elapsedTime = '00:00';
  }

  animateSamples() {
    if (this.isRecording) {
      this.samples = this.samples.map(() => {
        const randomHeight = Math.floor(Math.random() * 20) + 1;
        return { height: `${randomHeight}px` };
      });
      setTimeout(() => this.animateSamples(), 200);
    } else {
      this.samples = this.samples.map(() => ({ height: '10px' }));
    }
  }

  appendAudioElement(audioURL: string) {
    const audioElement = this.renderer.createElement('audio');
    this.renderer.setAttribute(audioElement, 'controls', '');
    this.renderer.setAttribute(audioElement, 'src', audioURL);
    this.renderer.appendChild(this.audioContainer.nativeElement, audioElement);
  }

  removeRecording() {
    this.isRecording = false;
    this.audioURL = null;
    const audioContainer = this.audioContainer.nativeElement;
    while (audioContainer.firstChild) {
      audioContainer.removeChild(audioContainer.firstChild);
    }
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.menu1.toggle(event);
  }
// #endregion



// #region close chat select message and other
  menuPosition = { x: 0, y: 0 };

  showContextMenu(event: MouseEvent) {
    event.preventDefault(); // Prevent the default context menu

    // Set menu position
    this.menuPosition = { x: event.clientX, y: event.clientY };

    // Display the custom menu
    this.displayMenu = true;
  }

  hideContextMenu() {
    this.displayMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    // Close the menu if clicking outside
    if (!targetElement.closest('.context-menu') ) {
      this.hideContextMenu();
    }
  }
  preventContextMenu(event: MouseEvent) {
    event.preventDefault(); // Prevent the default context menu
    event.stopPropagation(); // Stop the event from propagating
  }

  copyMessage() {
    console.log('Copy Message clicked');
    this.hideContextMenu();
  }

  editMessage() {
    console.log('Edit clicked');
    this.hideContextMenu();
  }

  deleteMessage() {
    console.log('Delete clicked');
    this.hideContextMenu();
  }
  // #endregion



  // #region react dropdown
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
  isEmojiPickerVisible = false;
  
  toggleEmojiPicker() {
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
      this.value=''
  }
  
  onEmojiSelect(event: any) {
    const emoji = event.emoji.native;
    if (emoji) {
      this.value = emoji;

      this.valueChange.emit(this.value);
      console.log(this.value)
      this.messageForm.controls['content'].setValue(this.messageForm.controls['content'].value + this.value);
      // this.isEmojiPickerVisible = false;
    }
  }
  
  @HostListener('document:click', ['$event'])
  onclick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
  
    // Check if the click is outside the emoji picker container
    if (this.isEmojiPickerVisible && !targetElement.closest('.emoji-picker-container')) {
      this.isEmojiPickerVisible = false;
    }
  }
  

  // #endregion


  //#region new chat
  displayDialog: boolean = false;
  dialPad: Array<Array<{ label: string }>> = [
    [{ label: '1' }, { label: '2' }, { label: '3' }],
    [{ label: '4' }, { label: '5' }, { label: '6' }],
    [{ label: '7' }, { label: '8' }, { label: '9' }],
  ];

  loadUserToChat!: FormGroup;
  userToCaht!: UserDto;
  testUser!:NewUserToChat


    // Initialize the FormGroup here

    validateNumberInput(event: KeyboardEvent) {
      const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
      const isNumber = /^\d$/.test(event.key);
    
      // Allow backspace, arrows, and numbers
      if (!isNumber && !allowedKeys.includes(event.key)) {
        event.preventDefault(); // Block non-numeric input
      }
    }
    
    onInputChange(event: any) {
      const value = event.target.value;
    
      // Ensure the value contains only numbers
      const sanitizedValue = value.replace(/[^0-9]/g, '');
      this.loadUserToChat.controls['phone'].setValue(sanitizedValue, { emitEvent: false });
    }
    

  dialogShow() {
    this.displayDialog = true;
  }

  appendNumber(number: string) {
    const currentPhone = this.loadUserToChat.controls['phone'].value || '';
    const newPhone = currentPhone + number;
    this.loadUserToChat.controls['phone'].setValue(newPhone);
  }

  removeLastDigit() {
    const currentPhone = this.loadUserToChat.controls['phone'].value || '';
    if (currentPhone.length > 0) {
      const newPhone = currentPhone.slice(0, -1);
      this.loadUserToChat.controls['phone'].setValue(newPhone);
    }
  }
notFoundUser:boolean=false
  loadUsers() {
    const phoneValue = this.loadUserToChat.controls['phone'].value || '';
    if (phoneValue.length !== 11) {
      this.notFoundUser=false

      return;
    }

    this.http.get<NewUserToChat>(`${this.global.baseUrl}/Student/get-user-to-chat?phone=${phoneValue}`).subscribe({
      next: (user: NewUserToChat) => {
        if (user) {
          this.userToCaht = {
            id: user.id,
            imageUrl: user.imgURL,
            name: user.name,
            content: user.phone,
            status:StatusType.NotDelivered,
            time:new Date
          };
        } else {
        }
      },
      error: (err) => {
      }
    });



    this.signal.loadUser(phoneValue)
    .subscribe({
      next: (user: NewUserToChat) => {
        if (user) {
        } else {
          this.notFoundUser=true


        }
      },
      error: err => {
        console.error('Error loading user:', err);
      }
    });
      }
      selectUserToChat(user: UserDto) {
        // Check if the user is already in the users array
        const userExists = this.users.some(u => u.id === user.id);

        // If the user is not in the array, add them
        if (!userExists) {
          this.users.push(user);
        }

        // Set the selected user
        this.selectedUser = user;

        // Update the messages for the selected user
        this.updateSelectedMessages();

        // Scroll to the bottom of the message list
        this.scrollToBottom();
        this.displayDialog=false;
      }

  onPhoneNumberChange() {
    const phoneValue = this.loadUserToChat.controls['phone'].value;
    if (phoneValue && phoneValue.length === 11) {
      this.loadUsers();
    }
  }
  //#endregion
}
