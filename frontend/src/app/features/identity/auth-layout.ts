import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAudioLines } from '@ng-icons/lucide';

/**
 * Mise en page commune des blocs Spartan « signup-two-column » et « login-two-column » :
 * le formulaire à gauche, le panneau visuel à droite (photo à venir, masqué sur mobile).
 */
@Component({
  selector: 'app-auth-layout',
  imports: [NgIcon, RouterLink],
  providers: [provideIcons({ lucideAudioLines })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="grid min-h-svh lg:grid-cols-2">
      <div class="flex flex-col gap-4 p-6 md:p-10">
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
      <div class="bg-muted relative hidden lg:block" aria-hidden="true"></div>
    </div>
  `,
})
export class AuthLayout {}
