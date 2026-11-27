import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import axe from 'axe-core';
import { SessionStore } from '../../core/session/session-store';
import { AppShell } from './app-shell';

@Component({ template: '' })
class Blank {}

const MEMBER = { id: '0123456789abcdef01234567', name: 'Ada Lovelace', email: 'ada@example.com' };

describe('AppShell (coquille de l’application connectée)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: '', component: Blank },
          { path: 'decouvrir', component: Blank },
        ]),
      ],
    }).compileComponents();
    TestBed.inject(SessionStore).signedIn(MEMBER);
  });

  async function render() {
    const fixture = TestBed.createComponent(AppShell);
    await fixture.whenStable();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  }

  function menuButton(root: HTMLElement): HTMLButtonElement {
    return root.querySelector<HTMLButtonElement>('button[aria-label^="Menu du compte"]')!;
  }

  it('affiche la navigation et l’avatar avec les initiales du membre', async () => {
    const { root } = await render();

    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe('Navigation principale');
    expect(root.querySelector('nav a[href="/decouvrir"]')).not.toBeNull();
    expect(menuButton(root).textContent?.trim()).toBe('AL');
    expect(menuButton(root).getAttribute('aria-label')).toBe('Menu du compte de Ada Lovelace');
  });

  it('le menu du compte montre le nom, l’adresse, puis déconnecte et ramène à l’accueil', async () => {
    const { fixture, root } = await render();
    menuButton(root).click();
    await fixture.whenStable();

    const menu = document.body.querySelector('hlm-dropdown-menu')!;
    expect(menu.textContent).toContain('Ada Lovelace');
    expect(menu.textContent).toContain('ada@example.com');

    const signOut = Array.from(menu.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Se déconnecter'),
    )!;
    signOut.click();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/sessions/current')
      .flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));

    expect(TestBed.inject(SessionStore).isSignedIn()).toBe(false);
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('ACC-1 : aucune violation axe', async () => {
    const { root } = await render();
    const result = await axe.run(root, { rules: { 'color-contrast': { enabled: false } } });

    expect(result.violations).toEqual([]);
  });
});
