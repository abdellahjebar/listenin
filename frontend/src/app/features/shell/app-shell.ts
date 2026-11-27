import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAudioLines } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { SessionStore } from '../../core/session/session-store';
import { initials } from '../../shared/initials';

/** Coquille de l'application connectée : barre de navigation, menu du compte, page courante. */
@Component({
  selector: 'app-shell',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    NgIcon,
    HlmAvatarImports,
    HlmDropdownMenuImports,
  ],
  providers: [provideIcons({ lucideAudioLines })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-svh flex-col">
      <header class="border-b">
        <nav
          aria-label="Navigation principale"
          class="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4"
        >
          <a routerLink="/decouvrir" class="flex items-center gap-2 font-medium">
            <span
              class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"
            >
              <ng-icon name="lucideAudioLines" class="text-base" aria-hidden="true" />
            </span>
            ListenIn
          </a>
          <a
            routerLink="/decouvrir"
            routerLinkActive="is-active"
            ariaCurrentWhenActive="page"
            class="text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground text-sm aria-[current=page]:font-medium"
          >
            Découvrir
          </a>

          @if (session.currentMember(); as member) {
            <button
              type="button"
              class="focus-visible:ring-ring/50 ml-auto rounded-full outline-none focus-visible:ring-3"
              [hlmDropdownMenuTrigger]="accountMenu"
              align="end"
              [attr.aria-label]="'Menu du compte de ' + member.name"
            >
              <hlm-avatar>
                <span hlmAvatarFallback>{{ memberInitials() }}</span>
              </hlm-avatar>
            </button>

            <ng-template #accountMenu>
              <hlm-dropdown-menu class="min-w-56">
                <hlm-dropdown-menu-label>
                  <span class="block font-medium">{{ member.name }}</span>
                  <span class="text-muted-foreground block text-xs font-normal">
                    {{ member.email }}
                  </span>
                </hlm-dropdown-menu-label>
                <hlm-dropdown-menu-separator />
                <button hlmDropdownMenuItem type="button" (click)="signOut()">
                  Se déconnecter
                </button>
              </hlm-dropdown-menu>
            </ng-template>
          }
        </nav>
      </header>
      <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppShell {
  protected readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  protected readonly memberInitials = computed(() =>
    initials(this.session.currentMember()?.name ?? ''),
  );

  protected async signOut(): Promise<void> {
    await this.session.signOut();
    await this.router.navigateByUrl('/');
  }
}
