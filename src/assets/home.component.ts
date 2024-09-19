import { AfterViewInit, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Mode } from '../Other component/select-list/Mode';
import { ReceivedData } from '../Other component/select-list/received-data';
import { FormControl, FormGroup } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { GlobalVariablesService } from '../Service/global-variables.service';
import { Agencies, HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-50px)' }),
        animate('500ms', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { params: { direction: 'top' } }),
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100px)' }),
        animate('500ms', style({ opacity: 1, transform: 'translateX(0)' }))
      ], { params: { direction: 'right' } }),
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-100px)' }),
        animate('500ms', style({ opacity: 1, transform: 'translateX(0)' }))
      ], { params: { direction: 'left' } })
    ])
  ]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy{
  clearForm!:FormGroup
  agencies:Agencies[]=[]
  selectInputs: ReceivedData[] = [
    { id: 1, name: 'Pain Management' },
    { id: 2, name: 'Pediatric Surgery' },
    { id: 3, name: 'Pediatrics and New Born' }

  ]
  mode: Mode =
  {
    defaultBG: { light: '#f5f5f5', night: '#404954' },
    defaultBGHover: { light: '#ececec', night: '#47515d' },
    defaultBorderHover: { light: 'black', night: '#8391a2' },
    defaultBorder: { light: 'rgba(0, 0, 0, 0.42)', night: 'rgb(170, 184, 197)' },
    iconColor: { light: 'rgba(0, 0, 0, 0.42)', night: 'rgb(170, 184, 197)' },
    iconHoverColor: { light: 'black', night: '#8391a2' },
    OptionBG: { light: 'white', night: '#404954' },
    OptionLiHover: { light: '#f5f5f5', night: '#373f48' },
    OptionLiActive: { light: '#f5f5f5', night: '#373f48' },
    colorLabel: { light: '#000', night: '#b5d1eb' },
    OptionColorLiActive: { light: '#3f51b5', night: '#6973e3' }
  };
constructor(private global:GlobalVariablesService, private renderer: Renderer2,private service:HomeService){
  this.clearForm = new FormGroup({
    inputVal:new FormControl('')
  });
  this.clearForm.get('inputVal')?.valueChanges.subscribe(val => {
    if (!val) {
      this.showClear = false;
    }
  });
}
  showClear: boolean = false;

  selectResult: number = 0;

  handleFocus() {
    if (this.clearForm.get('inputVal')?.value) {
      this.showClear = true;
    }
  }

  handleBlur() {
    this.showClear = false;
  }
  clearValue() {
    // this.clearForm.get('inputVal')?.setValue('');
  }

  handleSelectedData(id: number) {
    this.selectResult = id - 1;
    console.log(this.selectResult);
  }



  imageUrls: string[] = [
    'assets/home.jpg',
    'assets/Logo.png',
    'assets/another-image.jpg' // Add more image URLs as needed
  ];

  currentImageUrlIndex = 0;
  url: string = this.imageUrls[this.currentImageUrlIndex];


  ngOnInit(): void {
    this.service.AgenciesFetch().subscribe(response=>{
      this.agencies=response
    })
    this.rotateImages();
    this.loadAgencies()
    this.service.loadAgencies(this.agencies);
    console.log(this.agencies)
  }

  rotateImages(): void {
    setInterval(() => {
      this.currentImageUrlIndex = (this.currentImageUrlIndex + 1) % this.imageUrls.length;
      this.url = this.imageUrls[this.currentImageUrlIndex];
    }, 2000); // Change image every 2 seconds
  }


   loadAgencies() {

  }






  private observer!: IntersectionObserver;

  ngAfterViewInit() {
    this.initIntersectionObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private initIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, options);

    const items = document.querySelectorAll('.item');
    items.forEach(item => {
      this.observer.observe(item);
    });
  }




  cards = [
    { title: 'Project Creation', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', animation: 'top' },
    { title: 'Software Development', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', animation: 'right' },
    { title: 'Project Management', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', animation: 'left' },
    { title: 'Project Implementation', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', animation: 'top' },
    { title: 'Software Update', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', animation: 'right' },
    { title: '24/7 Support', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', animation: 'left' }
  ];

  getAnimationType(index: number): string {
    // Apply specific animation based on index
    if (index % 3 === 0) return 'top';
    if (index % 3 === 1) return 'right';
    return 'left';
  }
}
