import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMusic } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { toApiFailure } from '../../core/api/api-failure';
import { ProfilesApi } from '../../core/api/profiles-api';

/** « Découvrir » (story 10) : les pistes récentes des membres arriveront avec le Portfolio. */
@Component({
  selector: 'app-discover-page',
  imports: [NgIcon, RouterLink, HlmButtonImports, HlmEmptyImports],
  providers: [provideIcons({ lucideMusic })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="mb-6 text-2xl font-bold">Découvrir</h1>

    @if (profileIncomplete()) {
      <section
        aria-label="Profil à compléter"
        class="mb-6 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>Complétez votre profil pour que les musiciens vous trouvent.</p>
        <a hlmBtn routerLink="/bienvenue">Compléter</a>
      </section>
    }

    <hlm-empty class="border">
      <hlm-empty-header>
        <hlm-empty-media variant="icon">
          <ng-icon name="lucideMusic" aria-hidden="true" />
        </hlm-empty-media>
        <h2 hlmEmptyTitle>Aucun morceau partagé pour l'instant</h2>
        <p hlmEmptyDescription>Les derniers morceaux partagés par les membres apparaîtront ici.</p>
      </hlm-empty-header>
    </hlm-empty>
  `,
})
export default class DiscoverPage {
  /** Rappel affiché tant que le profil n'a aucun instrument, ou s'il manque. */
  protected readonly profileIncomplete = signal(false);

  constructor() {
    inject(ProfilesApi)
      .getMine()
      .then(
        (profile) => this.profileIncomplete.set(profile.instruments.length === 0),
        (error: unknown) => this.profileIncomplete.set(toApiFailure(error).status === 404),
      );
  }
}
