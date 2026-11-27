import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';

/** Accueil des visiteurs ; un membre connecté est envoyé sur « Découvrir » (guestGuard). */
@Component({
  selector: 'app-home-page',
  imports: [RouterLink, HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto flex min-h-svh max-w-2xl flex-col justify-center gap-4 px-6 py-16">
      <p class="text-muted-foreground text-sm font-medium tracking-wide uppercase">ListenIn</p>
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
    </main>
  `,
})
export class HomePage {}
