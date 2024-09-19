import { TestBed } from '@angular/core/testing';

import { InterCeptorInterceptor } from './inter-ceptor.interceptor';

describe('InterCeptorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      InterCeptorInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: InterCeptorInterceptor = TestBed.inject(InterCeptorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
