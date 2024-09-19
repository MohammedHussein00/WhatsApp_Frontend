import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { GlobalVariablesService } from './global-variables.service';
import { Observable, from, BehaviorSubject, filter, take } from 'rxjs';
import { Receiver, UserDto, SenderType, NewUserToChat } from '../SharedComponent/private-chat/interfaces';

export interface ChatMessageDto {
  id: number;
  content: string;
  react: string;
  refMessage: string;
  senderId: string;
  time: Date;
  status: StatusType;
  contentType: ContentType;
  receiver: Receiver;
  senderType: SenderType;
}

// Enum for ContentType
export enum ContentType {
  Text = 'Text',
  File = 'File',
  Audio = 'Audio'
}

// Enum for StatusType
export enum StatusType {
  NotDelivered = 'NotDelivered',
  Delivered = 'Delivered',
  Readed = 'Readed'
}


@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private isConnected = new BehaviorSubject<boolean>(false);

  constructor(private global: GlobalVariablesService) {}

  startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.global.baseUrl}/chat`)
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

  addReceiveMessageListener = (callback: (messages: ChatMessageDto[]) => void) => {
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

  sendMessage = (email: string) => {
    return from(
      this.ensureConnected().toPromise().then(() => {
        return this.hubConnection?.invoke('SendMessage', email);
      }).catch(err => console.error('Error while sending message: ', err))
    );
  };
}
