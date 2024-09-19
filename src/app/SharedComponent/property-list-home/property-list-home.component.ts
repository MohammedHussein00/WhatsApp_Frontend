import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { NgClass, CommonModule, NgIf } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ChipsModule } from 'primeng/chips';
import { startWith, map, Observable } from 'rxjs';
import {  DropdownModule } from 'primeng/dropdown';
import { MenuItem ,TreeNode} from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { TreeSelectModule } from 'primeng/treeselect';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { SelectButtonModule } from 'primeng/selectbutton';
import { PaginatorModule } from 'primeng/paginator';

interface City {
  name: string;
  code: string;
}
@Component({
  selector: 'app-property-list-home',
  standalone: true,
  imports: [DropdownModule,
    SelectButtonModule,
    PaginatorModule,
    TreeSelectModule,
    TieredMenuModule,
    MultiSelectModule,
    MenuModule,
    InputNumberModule,
    ButtonModule,
    NgClass, CommonModule,
     NgIf, ChipsModule, FormsModule,
     MatChipsModule, MatIconModule, MatAutocompleteModule,
      MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './property-list-home.component.html',
  styleUrl: './property-list-home.component.scss',

})
export class PropertyListHomeComponent implements OnInit,OnChanges{
  buyRent: any = 'Buy'; // Initialize with default value
  enterLocation = 'Enter location';
  truCheck = 'TruCheck listings first';
  propertiesWithFloorPlans = 'Properties with floor plans';
  favouriteProperties = 'Favourite properties';
  savedSearches = 'Saved searches';
  muhammedHusseinSophyMustafa = 'Muhammed Hussein Sophy Mustafa';
  findMyAgent = 'Find my Agent';
  floorPlans = 'Floor Plans';
  guides = 'Guides';
  marketIntelligence = 'Market Intelligence';
  new = 'NEW';
  agentPortal = 'Agent Portal';
  events = 'Events';
  all = 'All';
  ready = 'Ready';
  offPlan = 'Off-Plan';
  residential = 'Residential';
  bedsAndBaths = 'Beds & Baths';
  saveSearch = 'Save Search';
  properties:Property[] = [
    {
      id: 1,
      price: '3,010,000',
      type: 'Apartment',
      imageSrc: 'assets/Screenshot 2024-06-18 212027.png',
      icons: [
        { type: 'room', number: '2' },
        { type: 'bath', number: '3' }
      ],
      area: '1,711',
      description: 'Ready to Move In | Call Now | Resale Unit',
      location: 'Al Khan, Sharjah',
      agentLogo: 'assets/logo.png'
    },
    {
      id: 1,
      price: '3,010,000',
      type: 'Apartment',
      imageSrc: 'assets/Screenshot 2024-06-18 212027.png',
      icons: [
        { type: 'room', number: '2' },
        { type: 'bath', number: '3' }
      ],
      area: '1,711',
      description: 'Ready to Move In | Call Now | Resale Unit',
      location: 'Al Khan, Sharjah',
      agentLogo: 'assets/logo.png'
    }  ];




    filterForm: FormGroup;
    selectedOption:City | undefined;
    options: City[] | undefined;
    stateOptions: any[] = [{ label: 'For Buy', value: 'one-way' },{ label: 'For Rent', value: 'return' }];
    stateValue: string = 'off';
    moreFilters: MenuItem[] | undefined;
    NodeService: TreeNode[] = []; // Ensure TreeNode[] type if needed

    selectedNodes: TreeNode[] = [];
    residentials!: City[];

    selectedresidentials!: City[];


    minPrice:number=0;
  constructor(private fb: FormBuilder,private elementRef: ElementRef,private sanitizer: DomSanitizer) {
    for (let i = 2; i < 22; i++) {
      this.properties.push({
        id: i,
        price: (i * 100000).toString(), // Different price values
        type: i % 2 === 0 ? 'Villa' : 'Apartment', // Different type values
        imageSrc: `assets/image${i}.png`, // Different imageSrc values
        icons: [
          { type: 'room', number: (i % 3 + 1).toString() }, // Different number of rooms
          { type: 'bath', number: (i % 2 + 1).toString() } // Different number of baths
        ],
        area: (i * 100).toString(), // Different area values
        description: `Property ${i} description`, // Different description values
        location: `Location ${i}`, // Different location values
        agentLogo: 'assets/logo.png'
      });
    }
    this.NodeService = [
      {

            label: 'Beds',
            data: 'Work Folder',
            icon: 'fas fa-bed', // Font Awesome class for beds
            children: [
              { label: '1', icon: '', data: '1' },
              { label: '2 ', icon: '', data: '2' },
              { label: '3', icon: '', data: '3' },
              { label: '4', icon: '', data: '4' },
              { label: '5', icon: '', data: '5' },
              { label: '6', icon: '', data: '6' },
              { label: '7', icon: '', data: '7' },
              { label: '8', icon: '', data: '8' },
              { label: '8+', icon: '', data: '8+' },
            ]
          },
      {

            label: 'Baths',
            data: 'Work Folder',
            icon: 'fas fa-bath',
            children: [
              { label: '1', icon: '', data: '1' },
              { label: '2', icon: '', data: '2' },
              { label: '3', icon: '', data: '3' },
              { label: '4', icon: '', data: '4' },
              { label: '5', icon: '', data: '5' },
              { label: '6', icon: '', data: '6' },
              { label: '6+', icon: '', data: '6+' },
            ]
          },

    ];

    this.filterForm = this.fb.group({
      city: [''],
      propertyType: [''],
      minPrice: [''],
      maxPrice: [''],
      minBeds: [''],
      maxBeds: [''],
      minBaths: [''],
      maxBaths: [''],
      keyword: ['']
    });
    this.filteredLocations = this.LocationsCtrl.valueChanges.pipe(
      startWith(null),
      map((Locations: string | null) => (Locations ? this._filter(Locations) : this.allLocations.slice())),
    );
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.selectedNodes)
  }
  ngOnInit(): void {
    this.options = [
      { name: 'For Buy', code: 'buy' },
      { name: 'For Rent', code: 'rent' }

  ];
    this.residentials = [
      { name: 'Apartment', code: 'Apartment' },
      { name: 'Villa', code: 'Villa' },
            { name: 'Town House', code: 'TownHouse' },

  ];
  this.selectedOption=this.options[0]


  this.moreFilters = [
    {
        label: 'Extra Filtration',
        items: [
            {
                label: 'Refresh',
                icon: 'pi pi-refresh'
            },
            {
                label: 'Export',
                icon: 'pi pi-upload'
            }
        ]
    }

];
this.orders = [
  { name: 'Top Rate', code: 'top rate' },
  { name: 'Min Price', code: 'min price' },
  { name: 'Max Price', code: 'max price' },
  { name: 'Latest', code: 'latest' },
  { name: 'Oldest', code: 'oldest' }
];
this.Agents = [
  { name: 'Australia', code: 'AU' },
  { name: 'Brazil', code: 'BR' },
  { name: 'China', code: 'CN' },
  { name: 'Egypt', code: 'EG' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'India', code: 'IN' },
  { name: 'Japan', code: 'JP' },
  { name: 'Spain', code: 'ES' },
  { name: 'United States', code: 'US' }
];
this.loadProperties(); // Load initial properties

}







statusActive:number=1
  filterByStatus(status: number): void {
    if (status === 1) {
      // this.filteredProjects = this.projects.slice(); // Show all projects
      this.statusActive=1
    } else if(status===2) {
      // this.filteredProjects = this.projects.filter(project => project.status === 'Ready'); // Filter by status
      this.statusActive=2


  }
}
///////////////////////

sortByBaths(properties: any[], order: City | undefined): any[] {
  if (!order) {
    return properties; // Return properties as is if no order is selected
  }

  switch (order.code) {
    case 'top rate':
      return properties.sort((a, b) => b.rate - a.rate); // Replace 'rate' with actual field
    case 'min price':
      return properties.sort((a, b) => parseFloat(a.price.replace(/,/g, '')) - parseFloat(b.price.replace(/,/g, '')));
    case 'max price':
      return properties.sort((a, b) => parseFloat(b.price.replace(/,/g, '')) - parseFloat(a.price.replace(/,/g, '')));
    case 'latest':
      return properties.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Replace 'date' with actual field
    case 'oldest':
      return properties.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Replace 'date' with actual field
    case 'max beds':
      return properties.sort((a, b) => b.beds - a.beds); // Sort by number of beds
    case 'min beds':
      return properties.sort((a, b) => a.beds - b.beds); // Sort by number of beds
    case 'max baths':
      return properties.sort((a, b) => b.baths - a.baths); // Sort by number of baths
    case 'min baths':
      return properties.sort((a, b) => a.baths - b.baths); // Sort by number of baths
    default:
      return properties;
  }
}
sortByBaths_Beds(): void {

}


/////////////////////



  activeTabIndex: number = 0;

  onTabChange(index: number) {
    this.activeTabIndex = index;
    console.log('Active Tab Index:', this.activeTabIndex);
  }
  // Placeholder methods for modal interactions
  callAgent() {
    // Implement call agent logic
  }

  sendEmail() {
    // Implement send email logic
  }

  sendWhatsApp() {
    // Implement send WhatsApp logic
  }

  values: string[] | undefined;


  ///////////////


  separatorKeysCodes: number[] = [ENTER, COMMA];
  LocationsCtrl = new FormControl('');
  filteredLocations: Observable<string[]>;
  Locations: string[] = [];
  allLocations: string[] = [];

  @ViewChild('LocationsInput') LocationsInput!: ElementRef<HTMLInputElement>;

  announcer = inject(LiveAnnouncer);


  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.Locations.push(value);
      this.filterProperties();
    }
    event.chipInput!.clear();
    this.LocationsCtrl.setValue(null);
  }

  remove(location: string): void {
    const index = this.Locations.indexOf(location);
    if (index >= 0) {
      this.Locations.splice(index, 1);
      this.announcer.announce(`Removed ${location}`);
      this.filterProperties();
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.Locations.push(event.option.viewValue);
    this.LocationsInput.nativeElement.value = '';
    this.LocationsCtrl.setValue(null);
    this.filterProperties();
  }


  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allLocations.filter(Locations => Locations.toLowerCase().includes(filterValue));
  }

  filteredProperties:Property[]=[]; // For displaying filtered properties

  filterProperties(): Observable<Property[]> {
    const filterValue = this.LocationsCtrl.value?.toLowerCase() || '';

    return new Observable<Property[]>(subscriber => {
      const filtered = this.properties.filter(property => {
        const propertyLocation = property.location.toLowerCase();

        // Check if any of the selected locations is a substring of the property's location
        const matchesLocation = this.Locations.length === 0 || this.Locations.some(location =>
          propertyLocation.includes(location.toLowerCase())
        );

        // Check if the property's location includes the filter value
        const matchesInput = filterValue === '' || propertyLocation.includes(filterValue);

        return matchesLocation && matchesInput;
      });

      subscriber.next(filtered);
    });
  }



  /////////////////
  dropdownVisible = false;
  maxPrice:number=0;
  filterByMaxPrice(): void {

  }


///////////////
Agents: City[] =[];

selectedAgents!: City ;




////////// order by
orders: City[] | undefined;

selectedorders: City | undefined;
sortProperties(properties: any[], order: City | undefined): any[] {
  if (!order) {
    return properties; // Return properties as is if no order is selected
  }

  switch (order.code) {
    case 'top rate':
      // Implement sorting logic for Top Rate (assuming there is a 'rate' field)
      return properties.sort((a, b) => b.rate - a.rate); // Replace 'rate' with actual field
    case 'min price':
      return properties.sort((a, b) => parseFloat(a.price.replace(/,/g, '')) - parseFloat(b.price.replace(/,/g, '')));
    case 'max price':
      return properties.sort((a, b) => parseFloat(b.price.replace(/,/g, '')) - parseFloat(a.price.replace(/,/g, '')));
    case 'latest':
      // Implement sorting logic for Latest (assuming there is a 'date' field)
      return properties.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Replace 'date' with actual field
    case 'oldest':
      return properties.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Replace 'date' with actual field
    default:
      return properties;
  }
}
sortByOrders(): void {
  if (!this.selectedorders) return;

  switch (this.selectedorders.code) {
    case 'min price':
      this.filteredProperties.sort((a, b) => 
        parseFloat(a.price.replace(/,/g, '')) - parseFloat(b.price.replace(/,/g, ''))
      );
      break;

    case 'max price':
      this.filteredProperties.sort((a, b) => 
        parseFloat(b.price.replace(/,/g, '')) - parseFloat(a.price.replace(/,/g, ''))
      );
      break;
      
    // case 'Top Rate':
    //   this.properties.sort((a, b) => b.rate - a.rate); // Assuming 'rate' is a property
    //   break;
      
    // case 'Latest':
    //   this.properties.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Assuming 'date' is a property
    //   break;
      
    // case 'Oldest':
    //   this.properties.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Assuming 'date' is a property
    //   break;
      
    default:
      // If no valid sorting criteria, or you can choose to keep the original order
      break;
  }
}
/////// paginator
totalRecords: number = 0; // Initialize with the total number of records
rowsPerPageOptions: number[] = [5,10, 20, 30]; // Options for rows per page

first: number = 0;
  rows: number = 5;
   // Current properties to display

   onPageChange(event: PageEvent): void {
    this.first = event.first || 0;
    this.rows = event.rows || 5;

    // Calculate the current page number
    const currentPage = Math.floor(this.first / this.rows) + 1;

    console.log(`Current Page: ${currentPage}`);
    console.log(`First: ${this.first}, Rows: ${this.rows}`);

    // Slice properties for the current page
      const startIndex = this.first;
      const endIndex = this.first + this.rows;
       this.filteredProperties = this.properties.slice(startIndex, endIndex);

    this.sortByOrders();
  }



  loadProperties(): void {
    this.totalRecords = this.properties.length;
    this.filteredProperties = this.properties.slice(this.first, this.first + this.rows);

  }

  ////////////////
  mapListActive:boolean=false;
  toggleMapList(status: boolean): void {
    this.mapListActive = status;
  }
}
interface Property {
  id: number;
  price: string;
  type: string;
  imageSrc: string;
  icons: { type: string; number: string }[];
  area: string;
  description: string;
  location: string;
  agentLogo: string;
}
interface PageEvent {
  first?: number|undefined;
  rows?: number|undefined;
  page?: number|undefined;
  pageCount?: number|undefined;
}
