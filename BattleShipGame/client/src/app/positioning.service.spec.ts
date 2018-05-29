import { TestBed, inject } from '@angular/core/testing';

import { PositioningService } from './positioning.service';

describe('PositioningService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PositioningService]
    });
  });

  it('should be created', inject([PositioningService], (service: PositioningService) => {
    expect(service).toBeTruthy();
  }));
});
