import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatedUsersComponent } from './chated-users.component';

describe('ChatedUsersComponent', () => {
  let component: ChatedUsersComponent;
  let fixture: ComponentFixture<ChatedUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatedUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatedUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
