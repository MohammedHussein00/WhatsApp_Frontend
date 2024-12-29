import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { GlobalVariablesService } from './global-variables.service';
import { Observable, from, BehaviorSubject, filter, take } from 'rxjs';
import { Receiver, UserDto, SenderType, NewUserToChat } from '../SharedComponent/private-chat/interfaces';

export interface ChatMessageDto {
  id: number;
  content: string;
  reacts: ReactDto[];
  refMessage: string;
  senderId: string;
  time: Date;
  status: StatusType;
  contentType: ContentType;
  replayMessageId:number;
  receiver: Receiver;
  senderType: SenderType;
}

export interface ReactDto {
  id: number;
  react: string;
  messageId: number;
  userId: string;
}

// Enum for ContentType
export enum ContentType {
  Text = 0,
  File = 1,
  Audio = 2
}

// Enum for StatusType
export enum StatusType {
  NotDelivered = 0,
  Delivered = 1,
  Readed = 2,
  NotSended=3
}


@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private isConnected = new BehaviorSubject<boolean>(false);

  constructor(private global: GlobalVariablesService) {}

  startConnection = (userId: string) => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.global.baseUrl}/chat?userId=${userId}`) // Pass userId in the query string
      .build();

    return from(
      this.hubConnection.start()
        .then(() => {
          console.log('SignalR connection started');
          this.isConnected.next(true);
        })
        .catch(err => {
          console.error('Error while starting SignalR connection: ', err);
          this.isConnected.next(false);
        })
    );
  };


  private ensureConnected() {
    return this.isConnected.asObservable().pipe(
      filter(connected => connected),
      take(1)
    );
  }

  addReceiveMessageListener = (callback: (messages: ChatMessageDto) => void) => {
    this.hubConnection?.on('ReceiveMessage', callback);
  };

  loadUser = (phone: string) => {
    return new Observable<NewUserToChat>(observer => {
      this.ensureConnected().subscribe(() => {
        this.hubConnection?.invoke('LoadUser', phone)
          .then((user: any) => {
            console.log('Loaded users:', user);
            observer.next(user);
          })
          .catch(err => {
            console.error('Error while loading users:', err);
            observer.error(err);
          });
      });
    });
  };

  sendMessage = (messageId: number,receiverId:string) => {
    return from(
      this.ensureConnected().toPromise().then(() => {
        return this.hubConnection?.invoke('SendMessage', messageId,receiverId);
      }).catch(err => console.error('Error while sending message: ', err))
    );
  };

  readMessages = (userId: string,selectedUserId:string) => {
    return from(
      this.ensureConnected().toPromise().then(() => {
        return this.hubConnection?.invoke('readMessages', userId,selectedUserId);
      }).catch(err => console.error('Error while sending message: ', err))
    );
  };
  addReact = (userId: string,selectedUserId:string,reactDto:ReactDto) => {
    return from(
      this.ensureConnected().toPromise().then(() => {
        return this.hubConnection?.invoke('addReact', userId,selectedUserId,reactDto);
      }).catch(err => console.error('Error while sending message: ', err))
    );
  };

addReactListener = (callback: (react: ReactDto) => void) => {
  this.hubConnection?.on('listenerReact', callback);
};


addReedMessagesListener = (callback: (messages: number[]) => void) => {
  this.hubConnection?.on('ReadMessages', callback);
};
addDeliverMessagesListener = (callback: (userId: string) => void) => {
  this.hubConnection?.on('UpdateUsersMessagesToBeDeliveredExpectNewConnectedUser', callback);
};
}
