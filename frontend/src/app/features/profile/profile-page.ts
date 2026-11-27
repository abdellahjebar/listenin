import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { toApiFailure } from '../../core/api/api-failure';
import { type Profile, type ProfileUpdate, ProfilesApi } from '../../core/api/profiles-api';
import { SessionStore } from '../../core/session/session-store';
import { ProfileCard } from './profile-card';
import { ProfileForm } from './profile-form';

type State =
  | { kind: 'loading' }
  | { kind: 'loaded'; profile: Profile }
  | { kind: 'missing' }
  | { kind: 'error' };

/** « Mon profil » (story 3) : la fiche, et sa modification dans une Dialog. */
@Component({
  selector: 'app-profile-page',
  imports: [HlmButtonImports, HlmDialogImports, HlmSkeletonImports, ProfileCard, ProfileForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (state().kind) {
      @case ('loading') {
        <div class="flex gap-4" aria-busy="true" aria-label="Chargement du profil">
          <hlm-skeleton class="size-20 rounded-full" />
          <div class="flex flex-1 flex-col gap-3">
            <hlm-skeleton class="h-7 w-48" />
            <hlm-skeleton class="h-4 w-24" />
            <hlm-skeleton class="h-6 w-72" />
          </div>
        </div>
      }
      @case ('error') {
        <p role="alert" class="text-destructive">
          Le profil n'a pas pu être chargé. Réessayez dans un instant.
        </p>
      }
      @default {
        <div class="flex flex-col gap-6">
          @if (loadedProfile(); as profile) {
            <app-profile-card [profile]="profile" />
          } @else {
            <div>
              <h1 class="text-2xl font-bold">Mon profil</h1>
              <p class="text-muted-foreground">
                Votre profil est vide : complétez-le pour que les musiciens vous trouvent.
              </p>
            </div>
          }
          <div>
            <button hlmBtn type="button" (click)="openEditor()">
              {{ loadedProfile() ? 'Modifier mon profil' : 'Compléter mon profil' }}
            </button>
          </div>
        </div>
      }
    }

    <hlm-dialog #editor>
      <hlm-dialog-content *hlmDialogPortal="let ctx" class="sm:max-w-2xl">
        <hlm-dialog-header>
          <h2 hlmDialogTitle>Modifier mon profil</h2>
          <p hlmDialogDescription>Ce que les autres membres voient de vous.</p>
        </hlm-dialog-header>
        <app-profile-form
          [initial]="formInitial()"
          (saved)="onSaved($event)"
          (cancelled)="editor.close()"
        />
      </hlm-dialog-content>
    </hlm-dialog>
  `,
})
export default class ProfilePage {
  private readonly profiles = inject(ProfilesApi);
  private readonly session = inject(SessionStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly editor = viewChild.required<HlmDialog>('editor');

  protected readonly state = signal<State>({ kind: 'loading' });
  protected readonly loadedProfile = computed(() => {
    const state = this.state();
    return state.kind === 'loaded' ? state.profile : null;
  });
  protected readonly formInitial = computed<ProfileUpdate>(
    () =>
      this.loadedProfile() ?? {
        name: this.session.currentMember()?.name ?? '',
        instruments: [],
        genres: [],
        city: '',
        bio: '',
        contact: null,
      },
  );

  /** /profil?modifier=1 (menu du compte) ouvre la modification, même si la page est déjà ouverte. */
  private readonly queryParams = toSignal(this.route.queryParamMap);

  constructor() {
    void this.load();
    effect(() => {
      const wantsEditor = this.queryParams()?.has('modifier') ?? false;
      const ready = this.state().kind === 'loaded' || this.state().kind === 'missing';
      if (wantsEditor && ready) {
        untracked(() => {
          this.openEditor();
          void this.router.navigate([], { queryParams: {}, replaceUrl: true });
        });
      }
    });
  }

  private async load(): Promise<void> {
    try {
      this.state.set({ kind: 'loaded', profile: await this.profiles.getMine() });
    } catch (error) {
      this.state.set(toApiFailure(error).status === 404 ? { kind: 'missing' } : { kind: 'error' });
    }
  }

  protected openEditor(): void {
    this.editor().open();
  }

  protected onSaved(profile: Profile): void {
    this.state.set({ kind: 'loaded', profile });
    this.editor().close();
    toast('Profil enregistré');
  }
}
