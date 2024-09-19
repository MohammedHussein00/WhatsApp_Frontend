import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
   }
  // send(x:SendMessage): Observable<any> {
  //   return this.http.post<any>(`${this.global.baseUrl}/api/Admin/send-message`, x);
  // }
  // loadChat(email: string): Observable<ChatMessageDto[]> {
  //   return this.http.get<ChatMessageDto[]>(`${this.global.baseUrl}/api/Admin/laod-chat?email=${email}`);
  // }



  showContextMenu(event: MouseEvent,displayMenu: boolean,menu1:any) {
    event.preventDefault(); // Prevent default context menu

    // Display the menu
    displayMenu = true;
    
    // Position the menu based on the click event
    if (menu1) {
      const menuElement = menu1.el.nativeElement;
      menuElement.style.left = `${event.pageX}px`;
      menuElement.style.top = `${event.pageY}px`;
    }
  }

  // Optional: Hide the context menu if clicking outside
  hideContextMenu(displayMenu: boolean) {
    displayMenu = false;
  }

}
