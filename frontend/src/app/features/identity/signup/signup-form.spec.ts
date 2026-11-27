import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import axe from 'axe-core';
import { SessionStore } from '../../../core/session/session-store';
import { SignupForm } from './signup-form';

@Component({ template: '' })
class Blank {}

const VALID = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'une phrase de passe assez longue',
};

describe('SignupForm (story 1, écran)', () => {
  let fixture: ComponentFixture<SignupForm>;
  let http: HttpTestingController;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: '', component: Blank },
          { path: 'connexion', component: Blank },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupForm);
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

  function acceptTerms(): void {
    root.querySelector<HTMLElement>('[role="checkbox"]')!.click();
  }

  function fillValid(): void {
    type('name', VALID.name);
    type('email', VALID.email);
    type('password', VALID.password);
    type('confirmPassword', VALID.password);
    acceptTerms();
  }

  /** Laisse finir la réponse HTTP, l'action d'envoi et le rendu qui suit. */
  async function settle(): Promise<void> {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function submit(): Promise<void> {
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  function errorTexts(): string[] {
    return Array.from(root.querySelectorAll('hlm-field-error:not([hidden]), [role="alert"]'))
      .map((el) => el.textContent?.trim() ?? '')
      .filter(Boolean);
  }

  it('affiche les champs du bloc avec le contenu de ListenIn', () => {
    expect(root.querySelector('h1')?.textContent).toContain('Créer votre compte');
    for (const label of ['Nom', 'Adresse e-mail', 'Mot de passe', 'Confirmer le mot de passe']) {
      expect(root.textContent).toContain(label);
    }
    expect(root.textContent).toContain('15 caractères min.');
    expect(root.textContent).toContain("J'accepte les conditions d'utilisation");
  });

  it('le bouton Google est désactivé et annoncé comme bientôt disponible', () => {
    const google = Array.from(root.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Continuer avec Google'),
    )!;
    expect(google.disabled).toBe(true);
    expect(google.textContent).toContain('bientôt');
  });

  it('formulaire vide : aucune requête, erreurs affichées, focus sur le premier champ', async () => {
    await submit();

    http.expectNone('/api/accounts');
    expect(errorTexts()).toContain('Obligatoire');
    expect(document.activeElement?.id).toBe('name');
  });

  it('mot de passe de 14 caractères : refusé avant tout envoi', async () => {
    fillValid();
    type('password', 'a'.repeat(14));
    type('confirmPassword', 'a'.repeat(14));
    await submit();

    http.expectNone('/api/accounts');
    expect(errorTexts()).toContain('15 caractères min.');
  });

  it('confirmation différente : refusée avant tout envoi', async () => {
    fillValid();
    type('confirmPassword', `${VALID.password}!`);
    await submit();

    http.expectNone('/api/accounts');
    expect(errorTexts()).toContain('Ne correspond pas');
  });

  it('conditions non cochées : refusées avant tout envoi', async () => {
    fillValid();
    acceptTerms(); // décoche
    await submit();

    http.expectNone('/api/accounts');
    expect(root.querySelector('#acceptTerms')!.closest('hlm-field')!.textContent).toContain(
      'Obligatoire',
    );
  });

  it('inscription réussie : corps attendu par l’API, membre gardé, retour à l’accueil', async () => {
    const router = TestBed.inject(Router);
    fillValid();
    await submit();

    const request = http.expectOne('/api/accounts');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ ...VALID, acceptTerms: true });

    request.flush({ id: '0123456789abcdef01234567', name: VALID.name, email: VALID.email });
    await fixture.whenStable();

    expect(TestBed.inject(SessionStore).currentMember()?.name).toBe(VALID.name);
    expect(router.url).toBe('/');
  });

  it('pendant l’envoi : bouton désactivé et état annoncé', async () => {
    fillValid();
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();

    const submitButton = root.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(submitButton.disabled).toBe(true);
    expect(submitButton.textContent).toContain('Création du compte');

    http.expectOne('/api/accounts').flush({ id: '0123456789abcdef01234567', ...VALID });
    await fixture.whenStable();
  });

  it('409 : « adresse déjà utilisée » sous le champ adresse', async () => {
    fillValid();
    await submit();

    http
      .expectOne('/api/accounts')
      .flush(
        { error: { code: 'EmailAlreadyUsed', message: 'Cette adresse e-mail est déjà utilisée' } },
        { status: 409, statusText: 'Conflict' },
      );
    await settle();

    const emailField = root.querySelector('#email')!.closest('hlm-field')!;
    expect(emailField.textContent).toContain('Déjà utilisée');
  });

  it('429 : message général, neutre, en haut du formulaire', async () => {
    fillValid();
    await submit();

    http
      .expectOne('/api/accounts')
      .flush(
        { error: { code: 'TooManyRequests', message: 'Trop de tentatives' } },
        { status: 429, statusText: 'Too Many Requests' },
      );
    await settle();

    expect(root.querySelector('p[role="alert"]')?.textContent).toContain(
      'Trop de tentatives. Réessayez dans quelques minutes.',
    );
  });

  it('serveur injoignable : message général sans détail technique', async () => {
    fillValid();
    await submit();

    http.expectOne('/api/accounts').error(new ProgressEvent('error'));
    await settle();

    expect(root.querySelector('p[role="alert"]')?.textContent).toContain(
      'L’inscription n’a pas abouti.',
    );
  });

  it('ACC-1 et ACC-3 : aucune violation axe, formulaire vide puis en erreur', async () => {
    // Le contraste ne se calcule pas sans rendu réel (jsdom) : il est vérifié dans le navigateur.
    const options = { rules: { 'color-contrast': { enabled: false } } };

    expect((await axe.run(root, options)).violations).toEqual([]);

    await submit();
    expect((await axe.run(root, options)).violations).toEqual([]);
  });
});
