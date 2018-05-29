import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameboardPositioningComponent } from './gameboard-positioning.component';

describe('GameboardPositioningComponent', () => {
  let component: GameboardPositioningComponent;
  let fixture: ComponentFixture<GameboardPositioningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameboardPositioningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameboardPositioningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
