import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { SessionStore } from '../../core/session/session-store';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto flex min-h-svh max-w-2xl flex-col justify-center gap-4 px-6 py-16">
      <p class="text-muted-foreground text-sm font-medium tracking-wide uppercase">ListenIn</p>
      @if (session.currentMember(); as member) {
        <h1 class="text-4xl font-semibold tracking-tight text-balance">
          Bienvenue, {{ member.name }}
        </h1>
        <p class="text-muted-foreground max-w-prose text-lg">
          Vous êtes connecté. Votre profil et votre portfolio arrivent bientôt.
        </p>
        <div>
          <button hlmBtn variant="outline" type="button" (click)="signOut()">Se déconnecter</button>
        </div>
      } @else {
        <h1 class="text-4xl font-semibold tracking-tight text-balance">
          Le réseau professionnel des musiciens
        </h1>
        <p class="text-muted-foreground max-w-prose text-lg">
          Un portfolio audio, des crédits, des contacts : on écoute un musicien avant de l'engager.
        </p>
        <div class="flex flex-wrap gap-3">
          <a hlmBtn routerLink="/inscription">Créer un compte</a>
          <a hlmBtn variant="outline" routerLink="/connexion">Se connecter</a>
        </div>
      }
    </main>
  `,
})
export class HomePage {
  protected readonly session = inject(SessionStore);

  protected signOut(): Promise<void> {
    return this.session.signOut();
  }
}
