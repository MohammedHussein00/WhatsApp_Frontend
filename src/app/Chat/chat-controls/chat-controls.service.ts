import { Injectable } from '@angular/core';
import { Subject ,Observable} from 'rxjs';
import { GlobalVariablesService } from '../GlobalVariableService/global-variables.service';
import { HttpClient } from '@angular/common/http';
import { ChatMessageDto } from '../../Service/signal-r.service';
import WaveSurfer from 'wavesurfer.js';

export interface SendMessageResponseDto{
  id:number;
  delivered:boolean;
}
@Injectable({
  providedIn: 'root'
})
export class ChatControlsService {

  constructor(private global:GlobalVariablesService) { }

  private toggleReplayMenu = new Subject<Event>();
  toggleReplayMenu$ = this.toggleReplayMenu.asObservable();
  toggleReplayMenuFun(event: Event) {
    this.toggleReplayMenu.next(event);
  }


  send(x: FormData,http:HttpClient): Observable<ChatMessageDto> {
    return http.post<ChatMessageDto>(`${this.global.baseUrl}/User/send-message`, x);
  }


  wavesurfer!: WaveSurfer;
  filters: BiquadFilterNode[] = [];
  audio!:HTMLMediaElement
  CurrentFile!:File|Blob;
  private originalFilterValues: number[] = [];

  Init(CurrentFile: File|Blob, container: string) {

    this.CurrentFile=CurrentFile;
    if (this.wavesurfer != null) {

      this.wavesurfer.destroy();
    }

        this.wavesurfer = WaveSurfer.create({
          container: container,
          waveColor: 'blue',
          progressColor: 'blue',
          cursorColor: 'red',
          height: 28
        });

        if (CurrentFile) {

          this.wavesurfer.load(this.getAudioUrl(this.CurrentFile));


        }





  }
  getAudioUrl(CurrentFile: File|Blob): string {
    return URL.createObjectURL(CurrentFile);
  }
}
