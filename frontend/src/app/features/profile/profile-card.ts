import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import type { Profile } from '../../core/api/profiles-api';
import { GENRE_LABELS, INSTRUMENT_LABELS } from '../../core/catalog/catalog';
import { initials } from '../../shared/initials';

/** Fiche d'un profil (lecture seule), pour « Mon profil » et le profil d'un musicien (#67). */
@Component({
  selector: 'app-profile-card',
  imports: [HlmAvatarImports, HlmBadgeImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="flex flex-col gap-4 sm:flex-row sm:items-start">
      <hlm-avatar class="size-20 text-2xl">
        <span hlmAvatarFallback>{{ avatarInitials() }}</span>
      </hlm-avatar>
      <div class="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          <h1 class="text-2xl font-bold">{{ profile().name }}</h1>
          @if (profile().city) {
            <p class="text-muted-foreground">{{ profile().city }}</p>
          }
        </div>
        @if (instruments().length > 0) {
          <ul class="flex flex-wrap gap-1.5" aria-label="Instruments">
            @for (label of instruments(); track label) {
              <li>
                <span hlmBadge>{{ label }}</span>
              </li>
            }
          </ul>
        }
        @if (genres().length > 0) {
          <ul class="flex flex-wrap gap-1.5" aria-label="Genres">
            @for (label of genres(); track label) {
              <li>
                <span hlmBadge variant="outline">{{ label }}</span>
              </li>
            }
          </ul>
        }
        @if (profile().bio) {
          <p class="max-w-prose whitespace-pre-line">{{ profile().bio }}</p>
        }
        @if (contactLink(); as link) {
          <p class="text-sm">
            <span class="text-muted-foreground">Contact : </span>
            <a
              class="underline underline-offset-4"
              [href]="link.href"
              [attr.target]="link.external ? '_blank' : null"
              [attr.rel]="link.external ? 'noopener noreferrer' : null"
              >{{ link.text }}</a
            >
          </p>
        }
      </div>
    </article>
  `,
})
export class ProfileCard {
  readonly profile = input.required<Profile>();

  protected readonly avatarInitials = computed(() => initials(this.profile().name));
  protected readonly instruments = computed(() =>
    this.profile().instruments.map((code) => INSTRUMENT_LABELS[code]),
  );
  protected readonly genres = computed(() =>
    this.profile().genres.map((code) => GENRE_LABELS[code]),
  );
  /** Un lien https s'ouvre dans un nouvel onglet ; une adresse devient un lien mailto. */
  protected readonly contactLink = computed(() => {
    const contact = this.profile().contact;
    if (!contact) {
      return null;
    }
    return contact.startsWith('https://')
      ? { href: contact, text: contact.replace(/^https:\/\//, ''), external: true }
      : { href: `mailto:${contact}`, text: contact, external: false };
  });
}
