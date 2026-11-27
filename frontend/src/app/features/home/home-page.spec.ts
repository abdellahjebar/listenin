import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from '../../core/session/session-store';
import { HomePage } from './home-page';

const MEMBER = { id: '0123456789abcdef01234567', name: 'Ada Lovelace', email: 'ada@example.com' };

describe('HomePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('visiteur : présente ListenIn, propose de créer un compte ou de se connecter', async () => {
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toContain(
      'Le réseau professionnel des musiciens',
    );
    expect(root.querySelector('a[href="/inscription"]')?.textContent).toContain('Créer un compte');
    expect(root.querySelector('a[href="/connexion"]')?.textContent).toContain('Se connecter');
  });

  it('membre connecté : le salue, puis se déconnecte', async () => {
    TestBed.inject(SessionStore).signedIn(MEMBER);
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent).toContain('Bienvenue, Ada Lovelace');

    root.querySelector<HTMLButtonElement>('button')!.click();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/sessions/current')
      .flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();

    expect(root.querySelector('h1')?.textContent).toContain(
      'Le réseau professionnel des musiciens',
    );
  });
});
