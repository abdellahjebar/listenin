import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SessionStore } from './session-store';

const MEMBER = { id: '0123456789abcdef01234567', name: 'Ada Lovelace', email: 'ada@example.com' };

describe('SessionStore', () => {
  let store: SessionStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(SessionStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('au démarrage, reprend le membre si une session est active', async () => {
    const restoring = store.restore();
    http.expectOne('/api/sessions/current').flush(MEMBER);
    await restoring;

    expect(store.currentMember()).toEqual(MEMBER);
  });

  it('au démarrage, sans session (401), démarre en visiteur sans bloquer', async () => {
    const restoring = store.restore();
    http
      .expectOne('/api/sessions/current')
      .flush(
        { error: { code: 'Unauthenticated', message: 'x' } },
        { status: 401, statusText: 'Unauthorized' },
      );
    await restoring;

    expect(store.isSignedIn()).toBe(false);
  });

  it('API injoignable au démarrage : visiteur, sans bloquer', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const restoring = store.restore();
    http.expectOne('/api/sessions/current').error(new ProgressEvent('error'));
    await restoring;

    expect(store.isSignedIn()).toBe(false);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('déconnexion : détruit la session côté serveur et repasse en visiteur', async () => {
    store.signedIn(MEMBER);

    const signingOut = store.signOut();
    const request = http.expectOne('/api/sessions/current');
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
    await signingOut;

    expect(store.isSignedIn()).toBe(false);
  });
});
