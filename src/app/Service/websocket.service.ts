// src/app/service/websocket.service.ts
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject } from 'rxjs';
// src/app/models/user.model.ts
export interface User {
  id: string;
  username: string;
  // Add other properties as needed
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private hubConnection: HubConnection;
  private updateOnlineUsersSubject = new Subject<User[]>();
  private currentUser!: User;
  private configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  private peerConnection!: RTCPeerConnection | null;

  updateOnlineUsers$ = this.updateOnlineUsersSubject.asObservable();

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`https://localhost:7213/connection`)
      .configureLogging(signalR.LogLevel.None)
      .build();

    // Initialize the current user with a unique ID
    this.currentUser = {
      id: this.generateUserId(),
      username: 'currentUsername' // Replace with actual user data
    };
  }

  private generateUserId(): string {
    return Math.random().toString(36).substring(2, 15); // Generate a random unique ID
  }

  startConnection() {
    this.hubConnection.start().catch(err => console.error(err));
  }

  getCurrentUser(): User {
    return this.currentUser; // Return the current user object
  }

  registerUpdateOnlineUsersListener() {
    this.hubConnection.on('updateOnlineUsers', (userList: User[]) => {
      this.updateOnlineUsersSubject.next(userList);
    });
  }

  sendCallRequest(connectionId: string) {
    this.hubConnection.invoke('call', { connectionId }).catch(err => console.error(err));
  }

  sendEndCallRequest() {
    this.hubConnection.invoke('hangUp').catch(err => console.error(err));
  }

  sendAnswerCallResponse(accept: boolean, caller: User) {
    this.hubConnection.invoke('AnswerCall', accept, caller).catch(err => console.error(err));
  }

  setupPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.configuration);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to peer via SignalR
      }
    };

    this.peerConnection.ontrack = (event) => {
      // Handle incoming media stream
    };
  }

  async startLocalVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    stream.getTracks().forEach(track => this.peerConnection?.addTrack(track, stream));
  }

  endCall() {
    if (this.peerConnection) {
      this.peerConnection.close(); // Close peer connection
      this.peerConnection = null; // Reset peer connection
    }
    this.sendEndCallRequest(); // Notify server
  }
}
