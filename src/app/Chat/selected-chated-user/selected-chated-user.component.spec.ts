import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedChatedUserComponent } from './selected-chated-user.component';

describe('SelectedChatedUserComponent', () => {
  let component: SelectedChatedUserComponent;
  let fixture: ComponentFixture<SelectedChatedUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedChatedUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedChatedUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
