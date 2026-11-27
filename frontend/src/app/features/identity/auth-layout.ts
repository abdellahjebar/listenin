import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAudioLines } from '@ng-icons/lucide';

/**
 * Mise en page commune des blocs Spartan « signup-two-column » et « login-two-column » :
 * le formulaire à gauche, l'image à droite (masquée sur mobile).
 *
 * La page fait exactement la hauteur de la fenêtre : le document ne défile jamais. Si le
 * formulaire dépasse (petit écran, zoom à 200 %), seule sa colonne défile (WCAG 1.4.10).
 */
@Component({
  selector: 'app-auth-layout',
  imports: [NgIcon, RouterLink],
  providers: [provideIcons({ lucideAudioLines })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="grid h-svh lg:grid-cols-2">
      <div class="flex min-h-0 flex-col gap-4 overflow-y-auto p-6 md:px-10 md:py-6">
        <div class="flex justify-center gap-2 md:justify-start">
          <a routerLink="/" class="flex items-center gap-2 font-medium">
            <div
              class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"
            >
              <ng-icon name="lucideAudioLines" class="text-base" aria-hidden="true" />
            </div>
            ListenIn
          </a>
        </div>
        <main class="flex flex-1 items-center justify-center">
          <div class="w-full max-w-xs">
            <ng-content />
          </div>
        </main>
      </div>
      <!-- Affiche en entier, calée à gauche ; le fond reprend son beige pour un raccord invisible. -->
      <div class="relative hidden overflow-hidden bg-[#e5e5de] lg:block">
        <img
          src="images/auth-background.webp"
          alt=""
          class="absolute inset-0 h-full w-full object-contain object-left"
          fetchpriority="high"
        />
      </div>
    </div>
  `,
})
export class AuthLayout {}
