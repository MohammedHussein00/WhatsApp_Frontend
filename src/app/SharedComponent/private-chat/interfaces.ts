import { StatusType } from "../../Service/signal-r.service";

export interface User {
  id: number;
  name: string;
  messages: Message[];
  unreadMessagesCount: number;
}

export interface Message {
  senderId: string;
  content: string;
  time: Date;
}

export interface SendMessage {
  id: number;
  content: string;
  time: Date;
  senderId: string;
  receiverId: string;
}

export interface UserDto {
  id: string;
  name: string;
  content: string;
  time: Date;
  status: StatusType;
  imageUrl: string;
}

export interface Receiver {
  id: string;
  name: string;
  image: string;
}
export interface UploadEvent {
  originalEvent: Event;
  files: File[];
}
 export enum SenderType {
  Agent,
  Admin,
  User,
  SuberAdmin
}

export interface SelectedMessages {
  content: string;
  time: Date;
  name: string;

  senderId: string;
  receiverId: string;
  imageUrl: string;
  senderType: boolean;
}
export interface NewUserToChat {
  id: string;
  name: string;
  imgURL: string;
  phone: string;

}