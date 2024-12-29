import { TestBed } from '@angular/core/testing';

import { UsersGroupsService } from './users-groups.service';

describe('UsersGroupsService', () => {
  let service: UsersGroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersGroupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
