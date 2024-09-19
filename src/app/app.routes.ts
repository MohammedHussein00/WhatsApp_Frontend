import { Routes } from '@angular/router';
import { LayoutHomeComponent } from './SharedComponent/layout-home/layout-home.component';
import { HomeComponent } from './SharedComponent/home/home.component';
import { LoginComponent } from './SharedComponent/login/login.component';
import { PrivateChatComponent } from './SharedComponent/private-chat/private-chat.component';
import { RegisterComponent } from './SharedComponent/register/register.component';

export const routes: Routes = [
  {path:'',redirectTo:'/Home',pathMatch:'full'},
  {path:'',component:LayoutHomeComponent,children:[
    {path:'Home',component:HomeComponent}
  ]
},
{path:'login',component:LoginComponent},
{path:'sign-up',component:RegisterComponent},
{path:'chat',component:PrivateChatComponent}

];
