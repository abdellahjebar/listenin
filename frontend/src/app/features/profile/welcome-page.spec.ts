import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import axe from 'axe-core';
import { SessionStore } from '../../core/session/session-store';
import WelcomePage from './welcome-page';

@Component({ template: '' })
class Blank {}

const PROFILE = {
  memberId: '0123456789abcdef01234567',
  name: 'Ada Lovelace',
  instruments: [],
  genres: [],
  city: 'Nice',
  bio: '',
  contact: null,
};

describe('WelcomePage (« Complétez votre profil », après l’inscription)', () => {
  let fixture: ComponentFixture<WelcomePage>;
  let http: HttpTestingController;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'profil', component: Blank },
          { path: 'decouvrir', component: Blank },
        ]),
      ],
    }).compileComponents();
    TestBed.inject(SessionStore).signedIn({
      id: PROFILE.memberId,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(WelcomePage);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  async function settle(): Promise<void> {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('nom de l’inscription prérempli, puis les valeurs du profil existant', async () => {
    expect(root.querySelector<HTMLInputElement>('#profile-name')!.value).toBe('Ada Lovelace');

    http.expectOne('/api/profiles/me').flush(PROFILE);
    await settle();

    expect(root.querySelector<HTMLInputElement>('#profile-city')!.value).toBe('Nice');
    const result = await axe.run(root, { rules: { 'color-contrast': { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it('« Plus tard » mène à Découvrir, sans rien enregistrer', async () => {
    http.expectOne('/api/profiles/me').flush(PROFILE);
    await settle();

    Array.from(root.querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === 'Plus tard')!
      .click();
    await settle();

    expect(TestBed.inject(Router).url).toBe('/decouvrir');
  });

  it('enregistré : direction « Mon profil »', async () => {
    http.expectOne('/api/profiles/me').flush(PROFILE);
    await settle();

    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle();
    http.expectOne({ method: 'PUT', url: '/api/profiles/me' }).flush(PROFILE);
    await settle();

    expect(TestBed.inject(Router).url).toBe('/profil');
  });
});
