import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { TagPicker } from './tag-picker';

const OPTIONS = [
  { code: 'drums', label: 'Batterie' },
  { code: 'piano', label: 'Piano' },
];

@Component({
  imports: [TagPicker],
  template: `<label for="tags">Instruments</label>
    <app-tag-picker inputId="tags" [options]="options" [field]="tags.instruments" />`,
})
class Host {
  readonly options = OPTIONS;
  readonly model = signal({ instruments: ['drums', 'piano'] });
  readonly tags = form(this.model);
}

describe('TagPicker (choix multiple avec recherche)', () => {
  let fixture: ComponentFixture<Host>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  const input = () => root.querySelector<HTMLInputElement>('#tags')!;

  it('affiche chaque choix en étiquette, avec son libellé ; champ relié à son libellé', () => {
    const chips = Array.from(root.querySelectorAll('hlm-combobox-chip')).map((c) =>
      c.textContent?.trim(),
    );

    expect(chips).toEqual(['Batterie', 'Piano']);
    expect(input().labels?.[0]?.textContent).toBe('Instruments');
    expect(input().placeholder).toBe('');
  });

  it('Échap, liste fermée, ne vide pas les choix', async () => {
    input().focus();
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.model().instruments).toEqual(['drums', 'piano']);
  });

  it('sans choix : l’indication s’affiche dans le champ', async () => {
    fixture.componentInstance.model.set({ instruments: [] });
    await fixture.whenStable();

    expect(input().placeholder).toBe('Rechercher…');
  });
});
