import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterNewChatPanelComponent } from './filter-new-chat-panel.component';

describe('FilterNewChatPanelComponent', () => {
  let component: FilterNewChatPanelComponent;
  let fixture: ComponentFixture<FilterNewChatPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterNewChatPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterNewChatPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
