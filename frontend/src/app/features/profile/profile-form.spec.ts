import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import axe from 'axe-core';
import type { Profile, ProfileUpdate } from '../../core/api/profiles-api';
import { ProfileForm } from './profile-form';

const INITIAL: ProfileUpdate = {
  name: 'Ada Lovelace',
  instruments: ['electric-guitar'],
  genres: ['blues'],
  city: 'Nice',
  bio: '',
  contact: null,
};

@Component({
  imports: [ProfileForm],
  template: `<app-profile-form
    [initial]="initial()"
    (saved)="saved.set($event)"
    (cancelled)="cancelled.set(true)"
  />`,
})
class Host {
  readonly initial = signal(INITIAL);
  readonly saved = signal<Profile | null>(null);
  readonly cancelled = signal(false);
}

describe('ProfileForm (stories 3 et 4, formulaire)', () => {
  let fixture: ComponentFixture<Host>;
  let http: HttpTestingController;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
    http = TestBed.inject(HttpTestingController);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  function type(id: string, value: string): void {
    const field = root.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new Event('blur'));
  }

  async function submit(): Promise<void> {
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  async function settle(): Promise<void> {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const labelRow = (id: string) => root.querySelector(`label[for="${id}"]`)!.parentElement!;

  it('reprend les valeurs de départ, instruments et genres en étiquettes lisibles', () => {
    expect(root.querySelector<HTMLInputElement>('#profile-name')!.value).toBe('Ada Lovelace');
    expect(root.querySelector<HTMLInputElement>('#profile-city')!.value).toBe('Nice');
    expect(root.querySelector('app-tag-picker')!.textContent).toContain('Guitare électrique');
    expect(root.textContent).toContain('Blues');
  });

  it('nom vide : « Obligatoire » sur la ligne du libellé, focus sur le champ, rien d’envoyé', async () => {
    type('profile-name', '   ');
    await submit();

    http.expectNone('/api/profiles/me');
    expect(labelRow('profile-name').textContent).toContain('Obligatoire');
    expect(document.activeElement?.id).toBe('profile-name');
  });

  it('A5 : contact ni https ni e-mail refusé ; compteur de la présentation', async () => {
    type('profile-contact', 'http://site.fr');
    type('profile-bio', 'Bonjour');
    await submit();

    http.expectNone('/api/profiles/me');
    expect(labelRow('profile-contact').textContent).toContain('Lien https:// ou adresse e-mail');
    expect(labelRow('profile-bio').textContent).toContain('7/1000');
  });

  it('enregistre : corps nettoyé, contact vide envoyé à null, profil rendu au parent', async () => {
    type('profile-name', '  Ada Lovelace  ');
    type('profile-bio', '  Guitariste blues.  ');
    await submit();

    const request = http.expectOne('/api/profiles/me');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ ...INITIAL, bio: 'Guitariste blues.', contact: null });
    const profile = { memberId: '0123456789abcdef01234567', ...INITIAL, bio: 'Guitariste blues.' };
    request.flush(profile);
    await settle();

    expect(fixture.componentInstance.saved()).toEqual(profile);
  });

  it('accepte une adresse e-mail comme contact', async () => {
    type('profile-contact', 'ada@example.com');
    await submit();

    const request = http.expectOne('/api/profiles/me');
    expect(request.request.body).toMatchObject({ contact: 'ada@example.com' });
    request.flush({ memberId: '0123456789abcdef01234567', ...INITIAL, contact: 'ada@example.com' });
    await settle();
  });

  it('400 : le refus du serveur s’affiche sur le champ concerné', async () => {
    await submit();

    http.expectOne('/api/profiles/me').flush(
      {
        error: {
          code: 'ValidationFailed',
          message: 'Requête invalide',
          details: [{ target: 'instruments.0', message: 'inconnu' }],
        },
      },
      { status: 400, statusText: 'Bad Request' },
    );
    await settle();

    expect(labelRow('profile-instruments').textContent).toContain('Refusé');
    expect(fixture.componentInstance.saved()).toBeNull();
  });

  it('panne du serveur : message général, le formulaire garde la saisie', async () => {
    type('profile-city', 'Antibes');
    await submit();

    http.expectOne('/api/profiles/me').flush(null, { status: 503, statusText: 'Unavailable' });
    await settle();

    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'L’enregistrement n’a pas abouti',
    );
    expect(root.querySelector<HTMLInputElement>('#profile-city')!.value).toBe('Antibes');
  });

  it('Annuler prévient le parent, sans rien envoyer', () => {
    const cancel = Array.from(root.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Annuler',
    )!;
    cancel.click();

    expect(fixture.componentInstance.cancelled()).toBe(true);
  });

  it('ACC-1 : aucune violation axe', async () => {
    const result = await axe.run(root, { rules: { 'color-contrast': { enabled: false } } });

    expect(result.violations).toEqual([]);
  });
});
