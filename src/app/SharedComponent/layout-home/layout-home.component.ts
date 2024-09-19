import { Component, OnInit } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { HomeHeaderComponent } from '../home-header/home-header.component';
import { ChipsModule } from 'primeng/chips';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MultiSelectModule } from 'primeng/multiselect';
import { PropertyListHomeComponent } from '../property-list-home/property-list-home.component';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, RouterOutlet } from '@angular/router';
import { routes } from '../../app.routes';


interface City {
  name: string;
  code: string;
}

interface City {
  name: string,
  code: string
}

@Component({
  selector: 'app-layout-home',
  standalone: true,
  imports: [
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MultiSelectModule,
    MatSelectModule,
    HomeComponent,
    HomeHeaderComponent,
    PropertyListHomeComponent,
    ChipsModule,
    DropdownModule,
    RouterOutlet
    ],
  templateUrl: './layout-home.component.html',
  styleUrls: ['./layout-home.component.scss']
})
export class LayoutHomeComponent implements OnInit {
  values: string = '';
  cities: City[] | undefined;

  selectedCity: City | undefined;
  selectedCities!: City[];

  ngOnInit() {
    this.cities = [
      {name: 'New York', code: 'NY'},
      {name: 'Rome', code: 'RM'},
      {name: 'London', code: 'LDN'},
      {name: 'Istanbul', code: 'IST'},
      {name: 'Paris', code: 'PRS'}
  ];
    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' }
    ];
  }
}
