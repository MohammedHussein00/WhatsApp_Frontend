import { Injectable } from '@angular/core';
import { ChatControlsService } from '../chat-controls/chat-controls.service';
import WaveSurfer from 'wavesurfer.js';
import { SelectedMessages } from '../../Service/interfaces';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessageDto, ReactDto } from '../../Service/signal-r.service';
import { GlobalVariablesService } from '../GlobalVariableService/global-variables.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(public chatControls: ChatControlsService,private global:GlobalVariablesService) { }

  toggleReplayMenu(event: Event) {
    this.chatControls.toggleReplayMenuFun(event);
  }

  getLastMessageTime(time: Date): string {
    const messageTime = new Date(time);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of the day
    const messageDate = new Date(messageTime);
    messageDate.setHours(0, 0, 0, 0); // Reset to start of the day

    if (messageDate.toDateString() === today.toDateString()) {
      // If the message is from today, return the formatted time
      return "Today";
    }

    // Check if the message was sent yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Check if the message was sent during the current week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    if (messageDate >= startOfWeek && messageDate <= today) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[messageDate.getDay()];
      return dayName;
    }

    // If none of the above, return the full date
    return this.formatDate(messageDate);
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

   getReplayMessageContent(replayedMessageId: number,selectedMessages:SelectedMessages[]): string {

    return selectedMessages.filter(m=>m.id==replayedMessageId)[0].content
  }
   getReplayMessageSenerName(replayedMessageId: number,selectedMessages:SelectedMessages[]): string {

    return selectedMessages.filter(m=>m.id==replayedMessageId)[0].senderId!==localStorage.getItem('id')?
    selectedMessages.filter(m=>m.id==replayedMessageId)[0].name:'You'
  }


  addReact(x: ReactDto,http:HttpClient): Observable<ReactDto> {
    return http.post<ReactDto>(`${this.global.baseUrl}/User/add-react`, x);
  }






  filters: BiquadFilterNode[] = [];
  audio!:HTMLMediaElement
  CurrentFile!:File|Blob;



   waveSurferInstances: Map<number, WaveSurfer> = new Map();

  Init(container: string, messageId: number): void {
    // Check if an instance already exists for this message
    if (this.waveSurferInstances.has(messageId)) {
      const existingInstance = this.waveSurferInstances.get(messageId);
      existingInstance?.destroy(); // Clean up the old instance
    }

    // Create a new WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: container,
      waveColor: 'blue',
      progressColor: 'blue',
      cursorColor: 'red',
      height: 28
    });

    // Store the instance in the map
    this.waveSurferInstances.set(messageId, wavesurfer);
    wavesurfer.setOptions({
      barWidth: 2
    });
  }

  loadAudio(messageId: number, audioUrl: string): void {
    const wavesurfer = this.waveSurferInstances.get(messageId);
    if (wavesurfer) {
      wavesurfer.load(audioUrl);
    } else {
      console.error(`WaveSurfer instance for message ${messageId} not found.`);
    }
  }

  destroyAllInstances(): void {
    this.waveSurferInstances.forEach((wavesurfer) => {
      wavesurfer.destroy();
    });
    this.waveSurferInstances.clear();
  }

getAudioMessageCurrentPlayTime(time:{messageId: number, value: number}[],message:SelectedMessages):number{
return time.filter(m=>m.messageId===message.id)[0].value
}
getAudioMessageCurrentPlayTimeString(time:{messageId: number, value: string}[],message:SelectedMessages):string{
return time.filter(m=>m.messageId===message.id)[0].value
}
}



