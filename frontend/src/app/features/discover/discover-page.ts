import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMusic } from '@ng-icons/lucide';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';

/** « Découvrir » (story 10) : les pistes récentes des membres arriveront avec le Portfolio. */
@Component({
  selector: 'app-discover-page',
  imports: [NgIcon, HlmEmptyImports],
  providers: [provideIcons({ lucideMusic })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="mb-6 text-2xl font-bold">Découvrir</h1>
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
export default class DiscoverPage {}
