import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatLayoutComponent } from './Chat/chat-layout/chat-layout.component';

export const routes: Routes = [
  {path:'',redirectTo:'/login',pathMatch:'full'},

{path:'login',component:LoginComponent},
{path:'chat',component:ChatLayoutComponent}

];
