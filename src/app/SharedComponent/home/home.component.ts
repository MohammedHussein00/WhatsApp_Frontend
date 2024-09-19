import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ElementRef, Renderer2, ViewChild, inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChipsModule } from 'primeng/chips';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { map, Observable, startWith } from 'rxjs';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GlobalVariablesService } from '../../Service/global-variables.service';

export interface Agencies {
  id: number;
  name: string;
  logoImageUrl: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule, // Add HttpClientModule here
    ChipsModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  clearForm!: FormGroup;
  agencies: Agencies[] = [];
  values: string[] | undefined;
  @ViewChild('fruitInput') fruitInput!: ElementRef<HTMLInputElement>;

  constructor(
    private global: GlobalVariablesService,
    private renderer: Renderer2,
    private http: HttpClient
  ) {
    this.clearForm = new FormGroup({
      inputVal: new FormControl('')
    });

    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => (fruit ? this._filter(fruit) : this.allFruits.slice())),
    );
  }

  ngOnInit(): void {
    this.http.get<any>(`${this.global.baseUrl}/api/Admin/laod-agencies`).subscribe(response => {
      console.log(response);
    });
  }

  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl('');
  filteredFruits!: Observable<string[]>;
  fruits: string[] = [];
  allFruits: string[] = ['Cairo', 'test'];

  announcer = inject(LiveAnnouncer);

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.fruits.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.fruitCtrl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);

      this.announcer.announce(`Removed ${fruit}`);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.fruits.push(event.option.viewValue);
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allFruits.filter(fruit => fruit.toLowerCase().includes(filterValue));
  }

  cards = [
    { title: 'Project Creation', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', animation: 'top' },
    { title: 'Software Development', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', animation: 'right' },
    { title: 'Project Management', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', animation: 'left' },
    { title: 'Project Implementation', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', animation: 'top' },
    { title: 'Software Update', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', animation: 'right' },
    { title: '24/7 Support', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', animation: 'left' }
  ];
}
