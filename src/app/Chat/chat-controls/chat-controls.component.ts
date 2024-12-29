import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FileUploadModule } from 'primeng/fileupload';
import { SelectedMessages, User, UserDto } from '../../Service/interfaces';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GlobalVariablesService } from '../GlobalVariableService/global-variables.service';
import { ChatMessageDto, SignalRService,ReactDto } from '../../Service/signal-r.service';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { Menu } from 'primeng/menu';
import { ChatControlsService } from './chat-controls.service';
import { response } from 'express';
import { ImageModule } from 'primeng/image';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { ToolbarModule } from 'primeng/toolbar';
import { Dialog, DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-chat-controls',
  standalone: true,
  imports: [
    FileUploadModule,
    OverlayPanelModule,
    PickerModule,
    NgIf,
    FormsModule,
    ImageModule,
    DialogModule,
    NgFor,
    ReactiveFormsModule,
    DropdownModule, SliderModule, ButtonModule, ToolbarModule, NgStyle
  ],
  templateUrl: './chat-controls.component.html',
  styleUrl: './chat-controls.component.scss'
})
export class ChatControlsComponent implements OnInit, AfterViewInit {
  messageForm: FormGroup;
  @ViewChild('waveform', { static: false }) waveformContainer!: ElementRef;
  @ViewChild('menu1') menu1: any;
  @ViewChild('replayMessageMenu') replayMessageMenu!: Menu;

  selectedUser: UserDto | null = null;
  selectedMessages: SelectedMessages[] = [];
  private recieveSound = new Audio('assets/recieve.mp3');
  private sendSound = new Audio('assets/send.mp3');
  users: UserDto[] = [];
  isSender: boolean = false;
  isMenuOpen = false;
  replayedMessage: SelectedMessages | null = null

  messages: ChatMessageDto[] = [];
  @ViewChild('conversationListContainer', { static: false }) conversationListContainer!: ElementRef;

  constructor(private renderer: Renderer2, private formBuilder: FormBuilder, private http: HttpClient, private global: GlobalVariablesService,
    private signal: SignalRService,
    public chatControls: ChatControlsService
  ) {
    this.messageForm = this.formBuilder.group({
      content: ['', Validators.required]
    });

    // Subscribe to the toggle event and open/close the menu
    this.chatControls.toggleReplayMenu$.subscribe((event: Event) => {

      // Select the element with the class 'controls'
      const controlElement = document.querySelector('.controls') as HTMLElement;
      const parentForWidth = document.querySelector('.parent-for-width') as HTMLElement;

      if (controlElement) {
        // Simulate a click event on the controls element
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });

        // Dispatch the click event programmatically
        controlElement.dispatchEvent(clickEvent);
        document.documentElement.style.setProperty('--replayMessage-width', `${parentForWidth?.clientWidth}px`);
        document.documentElement.style.setProperty('--replayMessage-content-width', `${controlElement?.clientWidth}px`);

        // Toggle the replayMessageMenu overlay panel and pass the event
        if (!this.isMenuOpen) {
          // Open the replayMessageMenu only if it's not already open
          this.replayMessageMenu.toggle(clickEvent);
          this.isMenuOpen = true; // Mark the menu as open
        }

      } else {
      }
    });

    this.global.getSelectedMessages().subscribe((messages: SelectedMessages[]) => {
      this.selectedMessages = messages;
    });
    this.global.getreplayedMessage().subscribe((message: SelectedMessages | null) => {
      this.replayedMessage = message;
    });

    this.global.getSelectedUser().subscribe((user: UserDto | null) => {
      this.selectedUser = user;
    });


  }
  ngOnInit(): void {
    this.global.getMessages().subscribe(messages => {
      this.messages = messages;
    });
    this.global.getUsers().subscribe(users => {
      this.users = users;
    });
  }






  // #region

  currentTimeInSeconds = 0;
  currentTimeInMinutes = 0;
  currentTimeInHours = 0;
  hours: string = '00'
  minutes: string = '00'
  mediaRecorder: any;
  chunks: any[] = [];
  audioURL: string | null = null;
  isRecording = false;
  elapsedTime = '00:00';
  intervalId: any;
  audioBlob: any;
  imageBlob: any;
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
        this.appendAudioElement();
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

  appendAudioElement() {
    // Delay execution until Angular has rendered the view
    setTimeout(() => {

      const container = this.waveformContainer?.nativeElement;
      if (!container) {
        return;
      }

      this.chatControls.Init(this.audioBlob, container);
      this.chatControls.wavesurfer.setOptions({
        barWidth: 2,
      });

      this.updateTime();
    }, 100);
  }

  updateTime() {
    if (this.chatControls.wavesurfer) {
      const duration = this.chatControls.wavesurfer.getDuration();
      this.currentTimeInMinutes = Math.floor(duration / 60);
      this.minutes = this.currentTimeInMinutes.toString().padStart(2, '0');

      this.currentTimeInHours = Math.floor(duration / 3600);
      this.hours = this.currentTimeInHours.toString().padStart(2, '0');

      this.chatControls.wavesurfer.on('audioprocess', () => {
        const currentTime = this.chatControls.wavesurfer.getCurrentTime();

        this.currentTimeInSeconds = Math.floor(currentTime % 60);
        this.currentTimeInMinutes = Math.floor((currentTime / 60) % 60);
        this.currentTimeInHours = Math.floor(currentTime / 3600);

        this.hours = this.currentTimeInHours.toString().padStart(2, '0');
        this.minutes = this.currentTimeInMinutes.toString().padStart(2, '0');
      });
    }
  }



  removeRecording() {
    this.isRecording = false;
    this.audioURL = null;
    this.audioBlob = null;
  }

  // #endregion


  // #region react dropdown
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
  isEmojiPickerVisible = false;

  toggleEmojiPicker() {
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
    this.value = ''
  }

  onEmojiSelect(event: any) {
    const emoji = event.emoji.native;
    if (emoji) {
      this.value = emoji;

      this.valueChange.emit(this.value);
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

  sendMessage() {

        if (this.messageForm.valid || this.audioBlob||this.imageBlob) {
      const id = localStorage.getItem('id');
      const form = new FormData();
      if (this.audioBlob) {
        form.append('content', this.chatControls.getAudioUrl(this.audioBlob));

        form.append('file', this.audioBlob, 'record.mp3');
        form.append('messageType', '2');

      }
      else if(this.imageBlob){
        form.append('content', this.chatControls.getAudioUrl(this.imageBlob));
        form.append('file', this.imageBlob, 'image.png');
        form.append('messageType', '1');
      }
      else {
        form.append('content', this.messageForm.controls['content'].value);
        form.append('messageType', '0');

      }
      form.append('senderId', id || '');
      form.append('receiverId', this.selectedUser?.id || '');
      if(this.replayedMessage)
      form.append('replayMessageId', this.replayedMessage?.id.toString());

      this.selectedMessages.push({
        id: 0,
        content: this.audioBlob ? this.chatControls.getAudioUrl(this.audioBlob):this.imageBlob? this.chatControls.getAudioUrl(this.imageBlob): this.messageForm.controls['content'].value,
        imageUrl: localStorage.getItem('imgUrl') || '',
        name: localStorage.getItem('id') || '',
        time: new Date(),
        senderType: (localStorage.getItem('id') || '') !== this.selectedUser?.id,
        senderId: localStorage.getItem('id') || '',
        receiverId: this.selectedUser?.id || '',
        contentType: this.audioBlob? 2: this.imageBlob? 1: 0,
        status: 3,
        reacts: [] ,
        replayMessageId:this.replayedMessage?.id||0
      })
      this.global.setSelectedMessages(this.selectedMessages)
      this.chatControls.send(form, this.http).subscribe((response) => {
        this.messages.push(response)
        this.global.setMessages(this.messages)
        this.messageForm.controls['content'].setValue('');
        this.sendSound.play()
        this.isSender = true
        this.audioBlob = null;
        this.imageBlob = null;
        this.audioURL = null
        this.isRecording = false
        this.replayMessageMenu.hide()
        this.replayedMessage=null

        this.signal.sendMessage(response.id || 0, this.selectedUser?.id || '').subscribe(response => {
          setTimeout(() => this.scrollToBottom(), 100);
        }
        );
        this.selectedMessages[this.selectedMessages.length - 1].status = response.status ? 1 : 0;
        this.selectedMessages[this.selectedMessages.length - 1].id = response.id;
      });

    }

  }




  updateSelectedMessages(): void {
    if (this.selectedUser) {
      this.selectedMessages = this.messages
        .filter(m => m.receiver?.id === this.selectedUser?.id || m.senderId === this.selectedUser?.id)
        .map(m => ({
          id: m.id,
          content: m.content,
          imageUrl: m.senderId === this.selectedUser?.id ? this.selectedUser?.imageUrl || '' : '',
          name: m.senderId === this.selectedUser?.id ? this.selectedUser?.name || '' : '',
          time: m.time,
          senderType: m.senderId !== this.selectedUser?.id,
          senderId: m.senderId,
          receiverId: m.receiver?.id,
          contentType: m.contentType,
          status: m.status,
          reacts: m.reacts,
          replayMessageId:m.replayMessageId
        }));
    }
    this.global.setSelectedMessages(this.selectedMessages);
    setTimeout(() => this.scrollToBottom(), 100);

  }
  scrollToBottom(): void {
    try {
      const conversationListContainer = this.conversationListContainer.nativeElement;
      this.renderer.setProperty(conversationListContainer, 'scrollTop', conversationListContainer.scrollHeight);
    } catch (err) {
    }
  }



  // Handle Document Input

  caption: string = ''


  @ViewChild('AttachmentMenu') attachmentMenu!: OverlayPanel;
  @ViewChild('closeAttachmentMenuDialog') dialog!: Dialog;

  showConfirmDialog: boolean = false;
  isOverlayVisible: boolean = false; // Track overlay visibility state

  // Open the overlay panel


  // Handle clicks outside the overlay to show the confirmation dialog
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (
      this.attachmentMenu &&
      this.attachmentMenu.container &&
      !this.attachmentMenu.container.contains(target) && // Click is outside the overlay
      (!this.attachmentMenu.container || !this.dialogIsClicked(target)) && // Not inside the dialog
      this.isOverlayVisible // Only trigger if overlay is open
    ) {
      this.showConfirmDialog = true; // Show confirmation dialog
    }
  }

  // Helper method to check if the dialog was clicked
  private dialogIsClicked(target: HTMLElement): boolean {
    const dialogContainer = document.querySelector('.p-dialog');
    return dialogContainer ? dialogContainer.contains(target) : false;
  }

  // Confirm the close action
  confirmClose(attachmentMenu: OverlayPanel): void {
    this.showConfirmDialog = false;
    this.isOverlayVisible = false; // Update visibility state
    attachmentMenu.hide(); // Hide the overlay

  }

  // Cancel the close action
  cancelClose(): void {
    this.showConfirmDialog = false;
  }
  //^ #region  attatchement

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cropArea') cropArea!: ElementRef<HTMLDivElement>;

  mode: string = 'draw'; // 'draw' or 'crop'
  isDrawing: boolean = false;
  colors: string[] = [
    '#000000', '#FFFFFF', '#C0C0C0', '#808080', '#404040',
    '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00',
    '#00FF80', '#00FFFF', '#0080FF', '#0000FF', '#8000FF',
    '#FF00FF', '#FF0080', '#800000', '#804000', '#808000',
    '#408000', '#004000', '#004080', '#000080', '#400080'
  ];
  highlightColors: string[] = ['#ffff005e', '#00ff005e', '#0080ff85', '#0080ff85', '#ff800094', '#8000ffa3']
  selectedColor: string = '#000000';
  selectedSize: number = 5;


  selectColor(color: string): void {
    this.selectedColor = this.hexToRgba(color);
  }

  hexToRgba(hex: string): string {
    // Extract the RGB and Alpha values from the hex string
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = parseInt(hex.slice(7, 9), 16) / 255; // Convert alpha from 0-255 to 0-1

    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  // Crop-related variables
  isResizingCrop: boolean = false;
  isMovingCrop: boolean = false;
  startX: number = 0;
  startY: number = 0;
  initialCropStyles: any = {};
  cropStyles = {
    x: 50,
    y: 50,
    width: 100,
    height: 100,
  };
  resizeDirection: string = '';
  imageDataHistory: any[] = [];  // To track image states for Undo/Redo
  currentHistoryIndex: number = -1;  // To track current history index
  img: HTMLImageElement | null = null;

  ngAfterViewInit(): void {
    this.canvas.nativeElement.width = 450;
    this.canvas.nativeElement.height = 400;
  }
  handlePhotosVideosInput(event: Event, overlayPanel: OverlayPanel, AttachmentMenu: OverlayPanel): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.img = new Image();
        this.img.onload = () => {
          const ctx = this.canvas.nativeElement.getContext('2d');
          if (ctx) {
            ctx.drawImage(this.img!, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
          }
          // Save initial image state for undo/redo functionality
          this.saveImageState();
        };
        this.img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      this.isOverlayVisible = true
    }

    // Hide the overlay panel
    overlayPanel.hide();
    AttachmentMenu.show(event);
    // Get the parent element with the class 'parent-for-width'
    const parentElement = document.querySelector('.parent-for-width');

    // Ensure the element exists
    if (parentElement) {
      const rect = parentElement.getBoundingClientRect();
      const left = rect.left;    // Left position of the element


      document.documentElement.style.setProperty('--custom-left', `${left + 8}px`);
      setTimeout(() => {
        if (AttachmentMenu.container) {
          const height = AttachmentMenu.container.offsetHeight;
          document.documentElement.style.setProperty('--custom-top', `${window.innerHeight - height - 30}px`);
        }
      }, 3);


    }



  }
  handleDocumentInput(event: Event, overlayPanel: OverlayPanel, AttachmentMenu: OverlayPanel): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.img = new Image();
        this.img.onload = () => {
          const ctx = this.canvas.nativeElement.getContext('2d');
          if (ctx) {
            ctx.drawImage(this.img!, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
          }
          // Save initial image state for undo/redo functionality
          this.saveImageState();
        };
        this.img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      this.isOverlayVisible = true
    }

    // Hide the overlay panel
    overlayPanel.hide();
    AttachmentMenu.show(event);
    // Get the parent element with the class 'parent-for-width'
    const parentElement = document.querySelector('.parent-for-width');

    // Ensure the element exists
    if (parentElement) {
      const rect = parentElement.getBoundingClientRect();
      const left = rect.left;    // Left position of the element
      const bottom = rect.bottom; // Bottom position of the element


      document.documentElement.style.setProperty('--custom-left', `${left + 8}px`);
      setTimeout(() => {
        if (AttachmentMenu.container) {
          const height = AttachmentMenu.container.offsetHeight;
          document.documentElement.style.setProperty('--custom-top', `${window.innerHeight - height - 30}px`);
        }
      }, 3);


    }



  }
  @ViewChild('photosVideosInput') photosVideosInput!: ElementRef<HTMLInputElement>;

  removeImage(AttachmentMenu: OverlayPanel): void {
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (ctx) {
      // Clear the canvas completely
      ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }
    this.isOverlayVisible = false; // Update visibility state
    // Reset image-related properties
    this.img = null;
    this.imageDataHistory = []; // Clear history for undo/redo
    this.currentHistoryIndex = -1;

    if (this.photosVideosInput) {
      this.photosVideosInput.nativeElement.value = ''; // Clear the file input
    }
    AttachmentMenu.hide();
    }

  // Start drawing
  startDrawing(event: MouseEvent): void {
    if (this.mode !== 'draw' && this.mode !== 'highlight' && this.mode !== 'erase') return;
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Save the canvas state before starting a new stroke
    this.saveImageState();

    this.isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
  }

  // Draw on canvas
  draw(event: MouseEvent): void {
    if (!this.isDrawing || (this.mode !== 'draw' && this.mode !== 'highlight' && this.mode !== 'erase')) return;

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.mode === 'draw' || this.mode === 'highlight') {

      ctx.lineWidth = this.selectedSize; // Example brush size
      ctx.strokeStyle = this.selectedColor; // Example brush color
      ctx.lineTo(event.offsetX, event.offsetY);
      ctx.stroke();
    }
    else {
      ctx.save(); // Save the current context state
      ctx.globalCompositeOperation = 'destination-out'; // Set to eraser mode
      ctx.beginPath();
      ctx.arc(event.offsetX, event.offsetY, this.selectedSize / 2, 0, Math.PI * 2); // Circular eraser
      ctx.fill();
      ctx.restore(); // Restore the context state
    }
  }

  // Stop drawing
  stopDrawing(): void {
    if (this.isDrawing) {
      this.isDrawing = false;

      // Save the canvas state after completing the stroke
      this.saveImageState();
    }
  }



  // Set mode (draw or crop)
  setMode(mode: string): void {
    this.mode = mode;
  }

  // Load an image onto the canvas
  loadImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.img = new Image();
        this.img.onload = () => {
          const ctx = this.canvas.nativeElement.getContext('2d');
          if (ctx) {
            ctx.drawImage(this.img!, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
          }
          // Save initial image state for undo/redo functionality
          this.saveImageState();
        };
        this.img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Save current canvas state for undo/redo
  // Save current canvas state for undo/redo
  saveImageState(): void {
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

      // If we are in the middle of a history sequence (not at the end), truncate the redo history
      if (this.currentHistoryIndex < this.imageDataHistory.length - 1) {
        this.imageDataHistory.splice(this.currentHistoryIndex + 1);
      }

      // Add the current image data to history
      this.imageDataHistory.push(imageData);
      this.currentHistoryIndex++;
    }
  }


  // Undo action
  undo(): void {
    if (this.currentHistoryIndex > 0) {
      this.currentHistoryIndex--;
      this.restoreImageState();
    }
  }

  // Redo action
  redo(): void {
    if (this.currentHistoryIndex < this.imageDataHistory.length - 1) {
      this.currentHistoryIndex++;
      this.restoreImageState();
    }
  }

  // Restore image from history
  restoreImageState(): void {
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (ctx && this.imageDataHistory[this.currentHistoryIndex]) {
      ctx.putImageData(this.imageDataHistory[this.currentHistoryIndex], 0, 0);
    }
  }

  // Start resizing crop area
  startCropResize(event: MouseEvent, direction: string): void {
    if (this.mode !== 'crop') return;

    this.isResizingCrop = true;
    this.resizeDirection = direction;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.initialCropStyles = { ...this.cropStyles };

    // Disable movement when resizing
    this.isMovingCrop = false;

    document.addEventListener('mousemove', this.resizeCropArea);
    document.addEventListener('mouseup', this.stopCropResize);
  }

  // Resize the crop area dynamically
  resizeCropArea = (event: MouseEvent): void => {
    if (!this.isResizingCrop) return;

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    if (this.resizeDirection === 'top-left') {
      this.cropStyles.x = this.initialCropStyles.x + deltaX;
      this.cropStyles.y = this.initialCropStyles.y + deltaY;
      this.cropStyles.width = this.initialCropStyles.width - deltaX;
      this.cropStyles.height = this.initialCropStyles.height - deltaY;
    } else if (this.resizeDirection === 'top-right') {
      this.cropStyles.y = this.initialCropStyles.y + deltaY;
      this.cropStyles.width = this.initialCropStyles.width + deltaX;
      this.cropStyles.height = this.initialCropStyles.height - deltaY;
    } else if (this.resizeDirection === 'bottom-left') {
      this.cropStyles.x = this.initialCropStyles.x + deltaX;
      this.cropStyles.width = this.initialCropStyles.width - deltaX;
      this.cropStyles.height = this.initialCropStyles.height + deltaY;
    } else if (this.resizeDirection === 'bottom-right') {
      this.cropStyles.width = this.initialCropStyles.width + deltaX;
      this.cropStyles.height = this.initialCropStyles.height + deltaY;
    }

    // Prevent negative values
    this.cropStyles.width = Math.max(10, this.cropStyles.width);
    this.cropStyles.height = Math.max(10, this.cropStyles.height);
  };

  // Stop resizing the crop area
  stopCropResize = (): void => {
    this.isResizingCrop = false;
    document.removeEventListener('mousemove', this.resizeCropArea);
    document.removeEventListener('mouseup', this.stopCropResize);
    this.saveImageState(); // Save state after crop resize
  };

  // Start moving the crop area
  startMoveCrop(event: MouseEvent): void {
    if (this.mode !== 'crop' || this.isResizingCrop) return;

    this.isMovingCrop = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.initialCropStyles = { ...this.cropStyles };

    document.addEventListener('mousemove', this.moveCropArea);
    document.addEventListener('mouseup', this.stopMoveCrop);
  }

  // Move the crop area dynamically
  moveCropArea = (event: MouseEvent): void => {
    if (!this.isMovingCrop) return;

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    this.cropStyles.x = Math.max(0, this.initialCropStyles.x + deltaX);
    this.cropStyles.y = Math.max(0, this.initialCropStyles.y + deltaY);
  };

  // Stop moving the crop area
  stopMoveCrop = (): void => {
    this.isMovingCrop = false;
    document.removeEventListener('mousemove', this.moveCropArea);
    document.removeEventListener('mouseup', this.stopMoveCrop);
  };

  // Confirm the crop area resizing
  // Confirm the crop area resizing
  confirmResize(): void {
    this.isResizingCrop = false;
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (ctx && this.img) {
      // Create a new canvas to crop the image based on the selected area
      const croppedImage = ctx.getImageData(
        this.cropStyles.x,
        this.cropStyles.y,
        this.cropStyles.width,
        this.cropStyles.height
      );
      const newCanvas = document.createElement('canvas');
      const newCtx = newCanvas.getContext('2d');
      if (newCtx) {
        // Set new canvas size to match the crop area
        newCanvas.width = this.cropStyles.width;
        newCanvas.height = this.cropStyles.height;
        newCtx.putImageData(croppedImage, 0, 0);

        // Update the main canvas with the cropped image
        ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);  // Clear canvas before drawing the cropped image
        ctx.drawImage(newCanvas, 0, 0);  // Draw the cropped image on the main canvas
        this.saveImageState();  // Save state after resizing/cropping
      }
    }
  }

  // Save the cropped image to be used elsewhere (e.g., download or further processing)
  saveImage(): void {
    const ctx = this.canvas.nativeElement.getContext('2d');

    if (ctx) {
      if (this.mode === 'crop' && this.cropStyles.width && this.cropStyles.height) {
        // Save cropped image
        const croppedImage = ctx.getImageData(
          this.cropStyles.x,
          this.cropStyles.y,
          this.cropStyles.width,
          this.cropStyles.height
        );
        const newCanvas = document.createElement('canvas');
        newCanvas.width = this.cropStyles.width;
        newCanvas.height = this.cropStyles.height;
        const newCtx = newCanvas.getContext('2d');
        if (newCtx) {
          newCtx.putImageData(croppedImage, 0, 0);
          const dataURL = newCanvas.toDataURL('image/png');
          this.imageBlob = this.dataURLToBlob(dataURL);


        }
      } else {
        // Save original image
        const originalImage = ctx.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        const newCanvas = document.createElement('canvas');
        newCanvas.width = this.canvas.nativeElement.width;
        newCanvas.height = this.canvas.nativeElement.height;
        const newCtx = newCanvas.getContext('2d');
        if (newCtx) {
          newCtx.putImageData(originalImage, 0, 0);
          const dataURL = newCanvas.toDataURL('image/png');
          this.imageBlob = this.dataURLToBlob(dataURL);


        }
      }
    }
  }

  // Helper function to convert DataURL to Blob
  private dataURLToBlob(dataURL: string): Blob {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const buffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(buffer);

    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([buffer], { type: mimeString });
  }




  // #endregion
}
