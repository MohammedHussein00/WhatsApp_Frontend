import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { ChatControlsComponent } from './chat-controls.component'; // Your standalone component

describe('ChatControlsComponent', () => {
  let component: ChatControlsComponent;
  let fixture: ComponentFixture<ChatControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule, ChatControlsComponent] // Import the standalone component and HttpClientModule
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
