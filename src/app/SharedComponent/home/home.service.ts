import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalVariablesService } from '../../Service/global-variables.service';
export interface Agencies {
  id: number;
  name: string;
  logoImageUrl: string;
}
@Injectable({
  providedIn: 'root'
})
export class HomeService {

  // constructor(private http:HttpClient,private global:GlobalVariablesService) { }





  // loadAgencies(agencies:Agencies[]){
  //   this.AgenciesFetch().subscribe(response=>{
  //     agencies=response
  //   })
  // }
  // AgenciesFetch():Observable<Agencies[]>{
  //   return  this.http.get<Agencies[]>(`${this.global.baseUrl}/User/laod-agencies`)
  // }
}
