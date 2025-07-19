import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Epi } from './epi';

describe('Epi', () => {
  let component: Epi;
  let fixture: ComponentFixture<Epi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Epi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Epi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
