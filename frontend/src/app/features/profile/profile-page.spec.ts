import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import axe from 'axe-core';
import { SessionStore } from '../../core/session/session-store';
import ProfilePage from './profile-page';

@Component({ template: '' })
class Blank {}

const PROFILE = {
  memberId: '0123456789abcdef01234567',
  name: 'Ada Lovelace',
  instruments: ['electric-guitar'],
  genres: ['blues'],
  city: 'Nice',
  bio: 'Guitariste blues.',
  contact: null,
};

describe('ProfilePage (« Mon profil », story 3)', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'profil', component: ProfilePage },
          { path: '', component: Blank },
        ]),
      ],
    }).compileComponents();
    TestBed.inject(SessionStore).signedIn({
      id: PROFILE.memberId,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    document.body.querySelectorAll('hlm-dialog-content').forEach((el) => el.remove());
    http.verify();
  });

  async function settle(): Promise<void> {
    await harness.fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    harness.detectChanges();
    await harness.fixture.whenStable();
  }

  async function open(
    url: string,
    answer: (req: ReturnType<HttpTestingController['expectOne']>) => void,
  ) {
    const navigation = harness.navigateByUrl(url);
    await harness.fixture.whenStable();
    const root = harness.routeNativeElement!;
    const loading = root.querySelector('[aria-busy="true"]');
    answer(http.expectOne('/api/profiles/me'));
    await navigation;
    await settle();
    return { root, loading };
  }

  const dialog = () => document.body.querySelector('hlm-dialog-content');
  const button = (root: HTMLElement, text: string) =>
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes(text),
    )!;

  it('chargement (Skeleton), puis la fiche et « Modifier mon profil »', async () => {
    const { root, loading } = await open('/profil', (req) => req.flush(PROFILE));

    expect(loading).not.toBeNull();
    expect(root.querySelector('h1')?.textContent).toBe('Ada Lovelace');
    expect(button(root, 'Modifier mon profil')).toBeDefined();
    const result = await axe.run(root, { rules: { 'color-contrast': { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it('profil absent (404) : invitation à le compléter, nom de la session prérempli', async () => {
    const { root } = await open('/profil', (req) =>
      req.flush(
        { error: { code: 'ProfileMissing', message: 'Profil absent' } },
        { status: 404, statusText: 'Not Found' },
      ),
    );

    expect(root.textContent).toContain('Votre profil est vide');
    button(root, 'Compléter mon profil').click();
    await settle();
    expect(dialog()?.querySelector<HTMLInputElement>('#profile-name')?.value).toBe('Ada Lovelace');
  });

  it('panne du serveur : message d’erreur annoncé', async () => {
    const { root } = await open('/profil', (req) =>
      req.flush(null, { status: 500, statusText: 'Server Error' }),
    );

    expect(root.querySelector('[role="alert"]')?.textContent).toContain('pas pu être chargé');
  });

  it('modifier : Dialog préremplie ; enregistré, elle se ferme et la fiche change', async () => {
    const { root } = await open('/profil', (req) => req.flush(PROFILE));
    button(root, 'Modifier mon profil').click();
    await settle();

    expect(dialog()?.textContent).toContain('Modifier mon profil');
    const city = dialog()!.querySelector<HTMLInputElement>('#profile-city')!;
    expect(city.value).toBe('Nice');
    city.value = 'Antibes';
    city.dispatchEvent(new Event('input'));
    dialog()!
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));
    await settle();
    http.expectOne('/api/profiles/me').flush({ ...PROFILE, city: 'Antibes' });
    await settle();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await settle();

    expect(root.textContent).toContain('Antibes');
    expect(dialog()).toBeNull();
  });

  it('/profil?modifier=1 (menu du compte) ouvre la Dialog, puis retire le paramètre', async () => {
    await open('/profil?modifier=1', (req) => req.flush(PROFILE));

    expect(dialog()).not.toBeNull();
    expect(TestBed.inject(Router).url).toBe('/profil');
  });
});
