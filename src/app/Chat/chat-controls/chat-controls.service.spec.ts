import { TestBed } from '@angular/core/testing';

import { ChatControlsService } from './chat-controls.service';

describe('ChatControlsService', () => {
  let service: ChatControlsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatControlsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
