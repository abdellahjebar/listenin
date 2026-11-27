import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from '../../core/session/session-store';
import { HomePage } from './home-page';

describe('HomePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('visiteur : présente ListenIn et propose de créer un compte', async () => {
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toContain(
      'Le réseau professionnel des musiciens',
    );
    expect(root.querySelector('a[href="/inscription"]')?.textContent).toContain('Créer un compte');
  });

  it('membre tout juste inscrit : le salue par son nom', async () => {
    TestBed.inject(SessionStore).signedIn({
      id: '0123456789abcdef01234567',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain(
      'Bienvenue, Ada Lovelace',
    );
  });
});
