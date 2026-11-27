import { TestBed } from '@angular/core/testing';
import axe from 'axe-core';
import type { Profile } from '../../core/api/profiles-api';
import { ProfileCard } from './profile-card';

const PROFILE: Profile = {
  memberId: '0123456789abcdef01234567',
  name: 'Ada Lovelace',
  instruments: ['electric-guitar', 'bass-guitar'],
  genres: ['blues'],
  city: 'Nice',
  bio: 'Guitariste blues.',
  contact: 'https://instagram.com/ada.guitar',
};

async function render(profile: Profile): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(ProfileCard);
  fixture.componentRef.setInput('profile', profile);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('ProfileCard (fiche d’un profil)', () => {
  it('montre initiales, nom, ville, libellés français et présentation', async () => {
    const root = await render(PROFILE);

    expect(root.querySelector('[hlmAvatarFallback]')?.textContent?.trim()).toBe('AL');
    expect(root.querySelector('h1')?.textContent).toBe('Ada Lovelace');
    expect(root.textContent).toContain('Nice');
    const instruments = root.querySelector('ul[aria-label="Instruments"]')!.textContent;
    expect(instruments).toContain('Guitare électrique');
    expect(instruments).toContain('Basse');
    expect(root.querySelector('ul[aria-label="Genres"]')!.textContent).toContain('Blues');
    expect(root.textContent).toContain('Guitariste blues.');
  });

  it('contact https : nouvel onglet, sans transmettre la page d’origine', async () => {
    const link = (await render(PROFILE)).querySelector('a')!;

    expect(link.getAttribute('href')).toBe('https://instagram.com/ada.guitar');
    expect(link.textContent).toBe('instagram.com/ada.guitar');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('contact e-mail : lien mailto ; sans contact ni listes : rien d’affiché', async () => {
    const mail = await render({ ...PROFILE, contact: 'ada@example.com' });
    expect(mail.querySelector('a')!.getAttribute('href')).toBe('mailto:ada@example.com');
    expect(mail.querySelector('a')!.hasAttribute('target')).toBe(false);

    const bare = await render({ ...PROFILE, instruments: [], genres: [], bio: '', contact: null });
    expect(bare.querySelector('a')).toBeNull();
    expect(bare.querySelector('ul')).toBeNull();
  });

  it('ACC-1 : aucune violation axe', async () => {
    const result = await axe.run(await render(PROFILE), {
      rules: { 'color-contrast': { enabled: false } },
    });

    expect(result.violations).toEqual([]);
  });
});
