import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyListHomeComponent } from './property-list-home.component';

describe('PropertyListHomeComponent', () => {
  let component: PropertyListHomeComponent;
  let fixture: ComponentFixture<PropertyListHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyListHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyListHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
