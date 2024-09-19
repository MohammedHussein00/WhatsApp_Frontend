import { TestBed } from '@angular/core/testing';

import { PageVisitTrackerService } from './page-visit-tracker.service';

describe('PageVisitTrackerService', () => {
  let service: PageVisitTrackerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageVisitTrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
