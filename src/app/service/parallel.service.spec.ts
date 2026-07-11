import { TestBed } from '@angular/core/testing';

import { ParallelService } from './parallel.service';

describe('ParallelService', () => {
  let service: ParallelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParallelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
