import { TestBed } from '@angular/core/testing';
import axe from 'axe-core';
import DiscoverPage from './discover-page';

describe('DiscoverPage (story 10, en attente du Portfolio)', () => {
  it('ACC-5 : affiche un état vide explicite, sans violation axe', async () => {
    await TestBed.configureTestingModule({ imports: [DiscoverPage] }).compileComponents();
    const fixture = TestBed.createComponent(DiscoverPage);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toContain('Découvrir');
    expect(root.textContent).toContain("Aucun morceau partagé pour l'instant");
    const result = await axe.run(root, { rules: { 'color-contrast': { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
