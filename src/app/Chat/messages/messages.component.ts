import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, Renderer2, signal, ViewChild, ViewChildren } from '@angular/core';
import { ChatControlsComponent } from '../chat-controls/chat-controls.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule, NgClass, NgIf, NgStyle } from '@angular/common';
import { SelectedMessages, UserDto } from '../../Service/interfaces';
import { CardModule } from 'primeng/card';
import { GlobalVariablesService } from '../GlobalVariableService/global-variables.service';
import { SelectedChatedUserComponent } from '../selected-chated-user/selected-chated-user.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MessagesService } from './messages.service';
import { ChatMessageDto, SignalRService } from '../../Service/signal-r.service';
import { ContentObserver } from '@angular/cdk/observers';
import { ImageModule } from 'primeng/image';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    ChatControlsComponent,
    ReactiveFormsModule,
    MatMenuModule,
    OverlayPanelModule,
    NgClass,
    NgIf,
    ImageModule,
    SelectedChatedUserComponent,
    CardModule,
    NgStyle,
    CommonModule
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements AfterViewInit {
  selectedUser: UserDto | null = null;
  displayMenu: boolean = false;
  scrollToBottom: boolean = false;
  reactMessageId: number = 0;
  selectedMessages: SelectedMessages[] = [];
  messages: ChatMessageDto[] = [];
  groupedMessages: any[] = []

  @ViewChild('conversationListContainer') conversationListContainer!: ElementRef;

  constructor(private signal: SignalRService, private http: HttpClient, private renderer: Renderer2, private global: GlobalVariablesService, public messagesService: MessagesService, private observer: ContentObserver, private elRef: ElementRef) {

    this.global.getSelectedUser().subscribe((user: UserDto | null) => {
      this.selectedUser = user;
    });

    this.global.getMessages().subscribe((messages: ChatMessageDto[]) => {
      this.messages = messages;
    });
    this.global.getSelectedMessages().subscribe((messages: SelectedMessages[]) => {
      this.selectedMessages = messages;
      this.groupMessages()

      const isScrolledToBottom = this.isScrolledToEnd();

      if (isScrolledToBottom) {
        this.scrollToBottom = true;
        global.setIsScrollend(true);
        renderer.setProperty(this.conversationListContainer.nativeElement, 'scrollTop', this.conversationListContainer.nativeElement.scrollHeight);
      }
    });


  }




  isCurrentUser(senderId: string): boolean {
    return this.selectedUser?.id === senderId;
  }




  // #region close chat select message and other
  menuPosition = { x: 0, y: 0 };

  showContextMenu(event: MouseEvent) {
    event.preventDefault(); // Prevent the default context menu

    // Set menu position
    this.menuPosition = { x: event.clientX, y: event.clientY };

    // Display the custom menu
    if (this.selectedUser)
      this.displayMenu = true;
  }

  hideContextMenu() {
    this.displayMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    // Close the menu if clicking outside
    if (!targetElement.closest('.context-menu')) {
      this.hideContextMenu();
    }
  }
  preventContextMenu(event: MouseEvent) {
    event.preventDefault(); // Prevent the default context menu
    event.stopPropagation(); // Stop the event from propagating
  }




  // #endregion


  set_left_top_to_menu(event: MouseEvent) {
    if (event.clientY >= 360)
      document.documentElement.style.setProperty('--custom-top', `${event.clientY - 367}px`);
    else
      document.documentElement.style.setProperty('--custom-top', `${event.clientY}px`);
    if (event.clientX >= 1000)
      document.documentElement.style.setProperty('--custom-left', `${event.clientX - 300}px`);
    else
      document.documentElement.style.setProperty('--custom-left', `${event.clientX}px`);

  }

  copyMessage(messageId: number): void {
    // Find the message with the matching messageId
    const message = this.selectedMessages.find(msg => msg.id === messageId);

    // Check if the message exists
    if (message) {
      const messageContent = message.content;

      // Use the Clipboard API to copy the message content
      if (navigator.clipboard) {
        navigator.clipboard.writeText(messageContent).then(() => {
        }).catch(err => {
        });
      } else {
      }
    }
  }



  @ViewChildren('messageElement') messageElements!: QueryList<ElementRef>;

  scrollToMessage(messageId: number): void {
    const messageIndex = this.groupedMessages.flat().findIndex(msg => msg.id === messageId);

    if (messageIndex !== -1) {
      const messageElement = this.messageElements.toArray()[messageIndex]?.nativeElement;

      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
          messageElement.classList.add('darken-effect');
        }, 100); // Match CSS transition
        setTimeout(() => {
          messageElement.classList.remove('darken-effect');
        }, 600); // Match CSS transition
      }
    }
  }

  addMessageEffectOnDBClick(event: MouseEvent) {
    const clickedLi = event.currentTarget as HTMLElement; // Get the clicked <li> element

    // Add the class that applies the brightness filter
    clickedLi.classList.add('darken-effect');

    // Remove the class after the transition (500ms)
    setTimeout(() => {
      clickedLi.classList.remove('darken-effect');
    }, 500); // Wait for 500ms before removing the class
  }

  compareMessageDates(currentMessageTime: Date, nextMessageTime: Date): boolean {
    const currentDate = new Date(currentMessageTime);
    const nextDate = new Date(nextMessageTime);

    if (
      currentDate.getFullYear() === nextDate.getFullYear() &&
      currentDate.getMonth() === nextDate.getMonth() &&
      currentDate.getDate() === nextDate.getDate()
    )
      return true;
    else
      return false;

  }



  setReplayedMessage(messageId: number) {
    const message = this.selectedMessages.find(msg => msg.id === messageId);
    if (message)
      this.global.setreplayedMessage(message)
  }


  //#region close chat

  closeChat() {
    this.selectedUser = null;
    this.selectedMessages = [];
    this.groupedMessages = [];
    this.global.setSelectedUser(this.selectedUser);
    this.global.setSelectedMessages(this.selectedMessages);
  }
  //#endregion


  groupMessages() {
    // Flatten groupedMessages to check existing messages
    const existingMessages = this.groupedMessages.flat();

    // Find only new messages that are not already in groupedMessages
    const newMessages = this.selectedMessages.filter(
      (message) => !existingMessages.some(
        (existing) => existing.id === message.id // Assuming `id` is unique for each message
      )
    );

    if (newMessages.length === 0) {
      return; // No new messages, exit early
    }

    // Process each new message
    for (const message of newMessages) {
      const lastGroup = this.groupedMessages[this.groupedMessages.length - 1];

      if (
        lastGroup && // Ensure a last group exists
        this.compareMessageDates(message.time, lastGroup[lastGroup.length - 1].time)
      ) {
        // Append to the last group if the condition is met
        lastGroup.push(message);
      } else {
        // Otherwise, create a new group
        this.groupedMessages.push([message]);
      }
    }
  }





  ngAfterViewInit(): void {
    const initializedMessages = new Set<number>(); // Keep track of initialized messages

    const subscription = this.observer.observe(this.elRef.nativeElement).subscribe(() => {
      setTimeout(() => {
        this.selectedMessages.forEach((message) => {
          if (message?.contentType === 2 && !initializedMessages.has(message.id)) {
            const messageElementId = 'message-' + message.id;
            const element = document.getElementById(messageElementId);

            if (element) {
              // Mark the message as initialized
              initializedMessages.add(message.id);

              // Initialize a WaveSurfer instance for this message
              this.messagesService.Init(`#${messageElementId}`, message.id);

              // Load the audio file for this message
              this.messagesService.loadAudio(message.id, message.content);

            }
            this.currentTimeInSeconds.push({messageId:message.id,value:0})
            this.currentTimeInMinute.push({messageId:message.id,value:0})
            this.currentTimeInHours.push({messageId:message.id,value:0})
            this.hours.push({messageId:message.id,value:'00'})
            this.minutes.push({messageId:message.id,value:'00'})
          }
        });


        if (this.scrollToBottom) {
          this.renderer.setProperty(this.conversationListContainer.nativeElement, 'scrollTop', this.conversationListContainer.nativeElement.scrollHeight);
        }
        this.scrollToBottom = false;
        this.global.setIsScrollend(false);


      }, 1000);
    });
  }

  currentTimeInSeconds: {messageId: number, value: number}[] = [];
  currentTimeInMinute: {messageId: number, value: number}[] = [];
  currentTimeInHours: {messageId: number, value: number}[] = [];
  hours: {messageId: number, value: string}[] = [];
  minutes: {messageId: number, value: string}[] = [];

  playAudio(messageId: number) {
    // Pause other audio instances
    this.messagesService.waveSurferInstances.forEach((waveSurferInstance) => {
      if (this.messagesService.waveSurferInstances.get(messageId) !== waveSurferInstance)
        waveSurferInstance.pause();
    });

    // Toggle play/pause for the current messageId
    const currentWaveSurfer = this.messagesService.waveSurferInstances.get(messageId);
    currentWaveSurfer?.playPause();

    // Update time values on 'audioprocess' event
    currentWaveSurfer?.on('audioprocess', () => {
      const currentTime = currentWaveSurfer!.getCurrentTime(); // Get the current time of the audio in seconds

      // Update currentTimeInSeconds
      const existingSecondIndex = this.currentTimeInSeconds.findIndex(item => item.messageId === messageId);
      if (existingSecondIndex !== -1) {
        this.currentTimeInSeconds[existingSecondIndex].value = parseFloat(currentTime.toFixed(0));
      } else {
        this.currentTimeInSeconds.push({ messageId, value: parseFloat(currentTime.toFixed(0)) });
      }

      // Update currentTimeInMinute
      const minutes = Math.floor(currentTime / 60);
      const existingMinuteIndex = this.currentTimeInMinute.findIndex(item => item.messageId === messageId);
      if (existingMinuteIndex !== -1) {
        this.currentTimeInMinute[existingMinuteIndex].value = minutes;
      } else {
        this.currentTimeInMinute.push({ messageId, value: minutes });
      }

      // Update currentTimeInHours
      const hours = Math.floor(currentTime / (60 * 60));
      const existingHourIndex = this.currentTimeInHours.findIndex(item => item.messageId === messageId);
      if (existingHourIndex !== -1) {
        this.currentTimeInHours[existingHourIndex].value = hours;
      } else {
        this.currentTimeInHours.push({ messageId, value: hours });
      }

      // Update minutes and hours in string format
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedHours = hours.toString().padStart(2, '0');

      // Update hours and minutes arrays
      const existingMinuteStrIndex = this.minutes.findIndex(item => item.messageId === messageId);
      if (existingMinuteStrIndex !== -1) {
        this.minutes[existingMinuteStrIndex].value = formattedMinutes;
      } else {
        this.minutes.push({ messageId, value: formattedMinutes });
      }

      const existingHourStrIndex = this.hours.findIndex(item => item.messageId === messageId);
      if (existingHourStrIndex !== -1) {
        this.hours[existingHourStrIndex].value = formattedHours;
      } else {
        this.hours.push({ messageId, value: formattedHours });
      }
    });
  }





  isScrolling: boolean = false;
  private scrollTimeout: any;

  onScroll(event: Event): void {
    this.isScrolling = true; // Set `isScrolling` to true on scroll

    const target = event.target as HTMLElement; // Cast `event.target` to `HTMLElement`



    // Clear any previous timeout to avoid multiple calls
    clearTimeout(this.scrollTimeout);

    // Set a timeout to detect when scrolling stops
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false; // Set `isScrolling` to false when scrolling stops
    }, 500); // Adjust delay as needed
  }

  isScrolledToEnd(): boolean {
    if (!this.conversationListContainer) return false; // Safety check

    const element = this.conversationListContainer.nativeElement as HTMLElement;
    return Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1;
  }

  // <<<<<<<<<add react>>>>>>>>>>>
  addReact(messageId: number, value: string) {
    this.selectedMessages.forEach(message => {
      if (message.id === messageId) {
        // Ensure reacts is initialized as an array
        if (!message.reacts) {
          message.reacts = [];
        }

        // Find if the user has already reacted
        const existingReact = message.reacts.find(
          react => react.userId === (localStorage.getItem('id') || '')
        );
        if (existingReact) {
          if (existingReact.react !== value) {
            existingReact.react = value
            message.reacts.forEach(
              react => {
                if (react.userId === localStorage.getItem('id') || '')
                  react.react = value
              })

              message.reacts.filter(react => react.userId === existingReact.userId)[0].react = value;
              this.signal.addReact(localStorage.getItem('id')||'', this.selectedUser?.id||'', message.reacts.filter(react => react.userId === existingReact.userId)[0]
            ).subscribe(response => {
              });




          }
        } else {
          // Add a new reaction
          message.reacts.push({
            id: 0,
            react: value,
            userId: localStorage.getItem('id') || '',
            messageId: messageId
          });

          this.signal.addReact(localStorage.getItem('id')||'', this.selectedUser?.id||'', {
            id: 0,
            react: value,
            userId: localStorage.getItem('id') || '',
            messageId: messageId
          }).subscribe(response => {
            message.reacts.forEach(react => {
              if (react.userId === localStorage.getItem('id') && react.messageId === messageId) {
                react.id = response.id;


              }
            })
          });
        }
      }
    });
    this.global.setSelectedMessages(this.selectedMessages)
  }
  getGroupedReactions(message: SelectedMessages) {
    const groupedReactions: string[] = []; // Array to hold unique reactions

    // Group reactions by their value
    message.reacts.forEach(react => {
      // Only add the react value if it's not already in the groupedReactions array
      if (!groupedReactions.includes(react.react)) {
        groupedReactions.push(react.react);
      }
    });

    return groupedReactions;
  }


}
