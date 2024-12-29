import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SelectedMessages, UserDto } from '../../Service/interfaces';
import { ChatMessageDto, StatusType } from '../../Service/signal-r.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalVariablesService {
  baseUrl:string='https://localhost:7213'



  //~ current user data
  //#region
  currentUserImage: string | null = null;
  currentUserEmail: string | null = null;
  currentUserAbout: string | null = null;
  currentUserName: string | null = null;

  loadCurrentUserDataFromLocalStorage() {
    this.currentUserName = localStorage.getItem('name');
    this.currentUserEmail = localStorage.getItem('email');
    this.currentUserAbout = localStorage.getItem('about');
    this.currentUserImage = localStorage.getItem('imgUrl');
  }
  //#endregion

  private selectedMessages = new BehaviorSubject<SelectedMessages[]>([]);

  setSelectedMessages(messages: SelectedMessages[]) {
    return this.selectedMessages.next(messages);
  }
  getSelectedMessages():Observable<SelectedMessages[]> {
    return this.selectedMessages.asObservable();
  }


  private users = new BehaviorSubject<UserDto[]>([]);
  setUsers(users: UserDto[]) {
    return this.users.next(users);
  }
  getUsers():Observable<UserDto[]> {
    return this.users.asObservable();
  }


  messages = new BehaviorSubject <ChatMessageDto[]>([]);
  setMessages(newMessages: ChatMessageDto[]) {
    return this.messages.next(newMessages);
  }

  getMessages():Observable<ChatMessageDto[]> {
    return this.messages.asObservable();
  }



  private selectedUser = new BehaviorSubject<UserDto | null>(null);
  setSelectedUser(user: UserDto | null): void {
    return this.selectedUser.next(user);
  }

  getSelectedUser(): Observable<UserDto | null> {
    return this.selectedUser.asObservable();
  }


  private replayedMessage = new BehaviorSubject<SelectedMessages | null>(null);
  setreplayedMessage(message: SelectedMessages | null) {
    return this.replayedMessage.next(message);
  }
  getreplayedMessage(): Observable<SelectedMessages | null> {
    return this.replayedMessage.asObservable();
  }



  private userToChat = new BehaviorSubject<UserDto | null>(null);
  setuserToChat(user: UserDto | null) {
    return this.userToChat.next(user);
  }
  getuserToChat(): Observable<UserDto | null> {
    return this.userToChat.asObservable();
  }

  private   isScrollend= new BehaviorSubject<boolean | null>(null);
  setIsScrollend(isScrollend: boolean | null) {
    return this.isScrollend.next(isScrollend);
  }
  getIsScrollend(): Observable<boolean | null> {
    return this.isScrollend.asObservable();
  }
  // Observable to allow subscription



  getLastMessageTime(user: UserDto,messages:ChatMessageDto[]): string {
    const userMessages = messages.filter(m => m.receiver?.id === user.id || m.senderId === user.id);
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
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  }
  private formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  }
  getLastMessage(user: UserDto,messages:ChatMessageDto[]): string {
    const userMessages = messages.filter(m => m.receiver?.id === user.id || m.senderId === user.id);
    if (userMessages.length > 0) {
      const lastMessage = userMessages[userMessages.length - 1];
      return lastMessage.content || '';
    }
    return '';
  }
  isCurrentUserSendLastMessage(user: UserDto, messages: ChatMessageDto[]): { isLastMessageFromCurrentUser: boolean; statusType?: StatusType } {
    const userMessages = messages.filter(
      m => m.receiver?.id === user.id || m.senderId === user.id
    );

    if (userMessages.length > 0) {
      const lastMessage = userMessages[userMessages.length - 1];
      const currentUserId = localStorage.getItem('id');
      if(lastMessage.senderId === currentUserId)
      return {
        isLastMessageFromCurrentUser:true,
        statusType: lastMessage.status
      };
    }

    return { isLastMessageFromCurrentUser: false ,statusType:0};
  }

}
