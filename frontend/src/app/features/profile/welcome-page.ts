import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { type ProfileUpdate, ProfilesApi } from '../../core/api/profiles-api';
import { SessionStore } from '../../core/session/session-store';
import { ProfileForm } from './profile-form';

/** « Complétez votre profil » : juste après l'inscription, le même formulaire en page entière. */
@Component({
  selector: 'app-welcome-page',
  imports: [ProfileForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 class="text-2xl font-bold">Complétez votre profil</h1>
        <p class="text-muted-foreground">
          Dites ce que vous jouez : c'est ce que les autres musiciens chercheront.
        </p>
      </div>
      <app-profile-form
        cancelLabel="Plus tard"
        [initial]="initial()"
        (saved)="onSaved()"
        (cancelled)="later()"
      />
    </div>
  `,
})
export default class WelcomePage {
  private readonly router = inject(Router);
  private readonly profiles = inject(ProfilesApi);

  protected readonly initial = signal<ProfileUpdate>({
    name: inject(SessionStore).currentMember()?.name ?? '',
    instruments: [],
    genres: [],
    city: '',
    bio: '',
    contact: null,
  });

  constructor() {
    // Si le profil existe déjà (cas normal après l'inscription), on part de ses valeurs.
    this.profiles.getMine().then(
      (profile) => this.initial.set(profile),
      () => undefined,
    );
  }

  protected async onSaved(): Promise<void> {
    toast('Profil enregistré');
    await this.router.navigateByUrl('/profil');
  }

  protected later(): Promise<boolean> {
    return this.router.navigateByUrl('/decouvrir');
  }
}
