import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authGuard, guestGuard, safeReturnUrl } from './guards';
import { SessionStore } from './session-store';

@Component({ template: '' })
class Blank {}

const MEMBER = { id: '0123456789abcdef01234567', name: 'Ada Lovelace', email: 'ada@example.com' };

describe('protections d’accès', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: '', component: Blank, canActivate: [guestGuard] },
          { path: 'connexion', component: Blank, canActivate: [guestGuard] },
          { path: 'decouvrir', component: Blank, canActivate: [authGuard] },
        ]),
      ],
    });
    router = TestBed.inject(Router);
  });

  it('visiteur sur une page réservée : renvoyé à la connexion, avec l’adresse de retour', async () => {
    await router.navigateByUrl('/decouvrir');

    expect(router.url).toBe('/connexion?retour=%2Fdecouvrir');
  });

  it('membre sur la connexion ou l’accueil des visiteurs : envoyé sur « Découvrir »', async () => {
    TestBed.inject(SessionStore).signedIn(MEMBER);

    await router.navigateByUrl('/connexion');
    expect(router.url).toBe('/decouvrir');

    await router.navigateByUrl('/');
    expect(router.url).toBe('/decouvrir');
  });

  it.each([
    ['/profil', '/profil'],
    [null, '/decouvrir'],
    ['https://site-piege.example', '/decouvrir'],
    ['//site-piege.example', '/decouvrir'],
  ])('adresse de retour %s → %s (jamais vers un autre site)', (value, expected) => {
    expect(safeReturnUrl(value)).toBe(expected);
  });
});
