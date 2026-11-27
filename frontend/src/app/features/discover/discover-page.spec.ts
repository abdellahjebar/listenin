import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import axe from 'axe-core';
import DiscoverPage from './discover-page';

const PROFILE = {
  memberId: '0123456789abcdef01234567',
  name: 'Ada Lovelace',
  instruments: [],
  genres: [],
  city: '',
  bio: '',
  contact: null,
};

describe('DiscoverPage (story 10, en attente du Portfolio)', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscoverPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function render(answer: (req: ReturnType<HttpTestingController['expectOne']>) => void) {
    const fixture = TestBed.createComponent(DiscoverPage);
    answer(http.expectOne('/api/profiles/me'));
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const banner = (root: HTMLElement) => root.querySelector('[aria-label="Profil à compléter"]');

  it('ACC-5 : affiche un état vide explicite, sans violation axe', async () => {
    const root = await render((req) => req.flush({ ...PROFILE, instruments: ['piano'] }));

    expect(root.querySelector('h1')?.textContent).toContain('Découvrir');
    expect(root.textContent).toContain("Aucun morceau partagé pour l'instant");
    const result = await axe.run(root, { rules: { 'color-contrast': { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it('profil sans instrument : rappel avec un lien vers « Complétez votre profil »', async () => {
    const root = await render((req) => req.flush(PROFILE));

    expect(banner(root)?.querySelector('a')?.getAttribute('href')).toBe('/bienvenue');
  });

  it('profil absent (404) : rappel affiché', async () => {
    const root = await render((req) =>
      req.flush(
        { error: { code: 'ProfileMissing', message: 'Profil absent' } },
        { status: 404, statusText: 'Not Found' },
      ),
    );

    expect(banner(root)).not.toBeNull();
  });

  it('profil rempli, ou panne du serveur : pas de rappel', async () => {
    const filled = await render((req) => req.flush({ ...PROFILE, instruments: ['drums'] }));
    expect(banner(filled)).toBeNull();

    const failed = await render((req) =>
      req.flush(null, { status: 500, statusText: 'Server Error' }),
    );
    expect(banner(failed)).toBeNull();
  });
});
