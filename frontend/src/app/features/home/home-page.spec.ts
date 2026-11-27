import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomePage } from './home-page';

describe('HomePage (accueil des visiteurs)', () => {
  it('présente ListenIn et propose de créer un compte ou de se connecter', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toContain(
      'Le réseau professionnel des musiciens',
    );
    expect(root.querySelector('a[href="/inscription"]')?.textContent).toContain('Créer un compte');
    expect(root.querySelector('a[href="/connexion"]')?.textContent).toContain('Se connecter');
  });
});
