import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import { MenusService } from '../filter-new-chat-panel/menus.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ChatMessageDto } from '../../Service/signal-r.service';
import { GlobalVariablesService } from '../GlobalVariableService/global-variables.service';
import { HttpClient } from '@angular/common/http';
import { UserDto } from '../../Service/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UsersGroupsService {

  constructor(private menuService: MenusService,private global:GlobalVariablesService) { }
  hideContextMenu(displayMenu:boolean) {
    displayMenu = false;
  }
  scrollToBottom(conversationListContainerP: ElementRef, renderer: Renderer2
  ): void { // Accept Renderer2 here
    try {
      const conversationListContainer = conversationListContainerP.nativeElement;
      renderer.setProperty(conversationListContainer, 'scrollTop', conversationListContainer.scrollHeight); // Use the passed renderer
    } catch (err) {
    }
  }

  togglesortMenu(event: Event) {
    this.menuService.togglesortMenu(event);
  }
  toggleNewGroupMenu(event: Event) {
    this.menuService.toggleNewGroupMenu(event);
  }
  toggleReactUserMenu(event: Event) {
    this.menuService.toggleReactUserMenu(event);
  }




  //~ load chat
  loadChat(email: string,http:HttpClient): Observable<ChatMessageDto[]> {
    return http.get<ChatMessageDto[]>(`${this.global.baseUrl}/User/laod-chat?id=${email}`);
  }
    //& read chat between two users
  read(userId: string,senderId:string,http:HttpClient): Observable<any> {
    return http.get<any>(`${this.global.baseUrl}/User/read-messages?userId=${userId}&senderId=${senderId}`);
  }


  countUnread(user: UserDto,messages:ChatMessageDto[],selectedUser:UserDto|null): number {
    const userMessages = messages.filter(m => m.senderId === user.id && m.status===1);
    return userMessages.length;
  }
}
