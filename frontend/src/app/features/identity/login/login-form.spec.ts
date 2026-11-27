import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import axe from 'axe-core';
import { SessionStore } from '../../../core/session/session-store';
import { LoginForm } from './login-form';

@Component({ template: '' })
class Blank {}

const MEMBER = { id: '0123456789abcdef01234567', name: 'Ada Lovelace', email: 'ada@example.com' };
const PASSWORD = 'une phrase de passe assez longue';

describe('LoginForm (story 2, écran)', () => {
  let fixture: ComponentFixture<LoginForm>;
  let http: HttpTestingController;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: '', component: Blank },
          { path: 'inscription', component: Blank },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginForm);
    http = TestBed.inject(HttpTestingController);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  function type(id: string, value: string): void {
    const input = root.querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
  }

  async function settle(): Promise<void> {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function submitWith(emailValue: string, password: string): Promise<void> {
    type('email', emailValue);
    type('password', password);
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  function alertText(): string | undefined {
    return root.querySelector('p[role="alert"]')?.textContent?.trim();
  }

  it('affiche le bloc avec le contenu de ListenIn', () => {
    expect(root.querySelector('h1')?.textContent).toContain('Connectez-vous');
    expect(root.textContent).toContain('Adresse e-mail');
    expect(root.textContent).toContain('Mot de passe oublié ? Bientôt');
    expect(root.querySelector('a[href="/inscription"]')?.textContent).toContain('Créer un compte');
  });

  it('formulaire vide : aucune requête, focus sur l’adresse', async () => {
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();

    http.expectNone('/api/sessions');
    expect(document.activeElement?.id).toBe('email');
  });

  it('connexion réussie : identifiants envoyés, membre gardé, retour à l’accueil', async () => {
    await submitWith(MEMBER.email, PASSWORD);

    const request = http.expectOne('/api/sessions');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: MEMBER.email, password: PASSWORD });
    request.flush(MEMBER);
    await settle();

    expect(TestBed.inject(SessionStore).currentMember()).toEqual(MEMBER);
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('F4 : identifiants refusés, un seul message, sans dire lequel est faux', async () => {
    await submitWith('inconnu@example.com', PASSWORD);
    http
      .expectOne('/api/sessions')
      .flush(
        { error: { code: 'InvalidCredentials', message: 'x' } },
        { status: 401, statusText: 'Unauthorized' },
      );
    await settle();

    expect(alertText()).toBe('Adresse e-mail ou mot de passe incorrect.');
    expect(TestBed.inject(SessionStore).isSignedIn()).toBe(false);
  });

  it('429 : message neutre', async () => {
    await submitWith(MEMBER.email, PASSWORD);
    http
      .expectOne('/api/sessions')
      .flush(
        { error: { code: 'TooManyRequests', message: 'x' } },
        { status: 429, statusText: 'Too Many Requests' },
      );
    await settle();

    expect(alertText()).toBe('Trop de tentatives. Réessayez dans quelques minutes.');
  });

  it('ACC-1 et ACC-3 : aucune violation axe, vide puis en erreur', async () => {
    const options = { rules: { 'color-contrast': { enabled: false } } };
    expect((await axe.run(root, options)).violations).toEqual([]);

    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    expect((await axe.run(root, options)).violations).toEqual([]);
  });
});
