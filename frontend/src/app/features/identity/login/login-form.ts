import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  maxLength,
  required,
  type FieldTree,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { remixGoogleFill } from '@ng-icons/remixicon';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { toApiFailure } from '../../../core/api/api-failure';
import { SessionsApi } from '../../../core/api/sessions-api';
import { SessionStore } from '../../../core/session/session-store';

interface LoginModel {
  email: string;
  password: string;
}

/**
 * Formulaire du bloc Spartan « login-two-column », contenu adapté à ListenIn.
 * Pas de longueur minimale côté navigateur : elle révélerait la règle sans rien protéger, et
 * l'API répond de la même façon à une adresse inconnue et à un mauvais mot de passe (F4).
 */
@Component({
  selector: 'app-login-form',
  imports: [
    FormRoot,
    FormField,
    RouterLink,
    NgIcon,
    HlmFieldImports,
    HlmInputImports,
    HlmButtonImports,
    HlmSpinnerImports,
  ],
  providers: [provideIcons({ remixGoogleFill })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formRoot]="form" novalidate>
      <hlm-field-group class="gap-4">
        <div class="flex flex-col items-center gap-1 text-center">
          <h1 class="text-2xl font-bold">Connectez-vous</h1>
          <p class="text-muted-foreground text-sm text-balance">Accédez à votre compte ListenIn</p>
        </div>

        @if (generalError(); as message) {
          <p
            role="alert"
            class="border-destructive/50 text-destructive rounded-lg border px-3 py-2 text-sm"
          >
            {{ message }}
          </p>
        }

        <hlm-field>
          <label hlmFieldLabel for="email">Adresse e-mail</label>
          <input
            hlmInput
            type="email"
            id="email"
            autocomplete="username"
            placeholder="vous@exemple.com"
            [formField]="form.email"
          />
          @for (error of form.email().errors(); track error) {
            <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>
          }
        </hlm-field>

        <hlm-field>
          <div class="flex items-center">
            <label hlmFieldLabel for="password">Mot de passe</label>
            <span hlmFieldDescription class="ml-auto text-sm">Mot de passe oublié ? Bientôt</span>
          </div>
          <input
            hlmInput
            type="password"
            id="password"
            autocomplete="current-password"
            [formField]="form.password"
          />
          @for (error of form.password().errors(); track error) {
            <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>
          }
        </hlm-field>

        <hlm-field>
          <button hlmBtn type="submit" [disabled]="form().submitting()">
            @if (form().submitting()) {
              <hlm-spinner aria-label="Connexion en cours" />
              Connexion…
            } @else {
              Se connecter
            }
          </button>
        </hlm-field>

        <hlm-field-separator>Ou continuer avec</hlm-field-separator>

        <hlm-field>
          <button hlmBtn variant="outline" type="button" disabled>
            <ng-icon name="remixGoogleFill" class="text-xl" aria-hidden="true" />
            Continuer avec Google · bientôt
          </button>
          <p hlmFieldDescription class="text-center">
            Pas encore membre ?
            <a routerLink="/inscription">Créer un compte</a>
          </p>
        </hlm-field>
      </hlm-field-group>
    </form>
  `,
})
export class LoginForm {
  private readonly sessions = inject(SessionsApi);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  /** Erreur qui ne concerne aucun champ : identifiants refusés, trop de tentatives… */
  protected readonly generalError = signal<string | null>(null);

  protected readonly model = signal<LoginModel>({ email: '', password: '' });

  readonly form = form(
    this.model,
    (path) => {
      required(path.email, { message: 'L’adresse e-mail est obligatoire.' });
      email(path.email, { message: 'Saisissez une adresse e-mail valide.' });
      maxLength(path.email, 254, { message: 'L’adresse e-mail est trop longue.' });
      required(path.password, { message: 'Le mot de passe est obligatoire.' });
      maxLength(path.password, 128, { message: 'Le mot de passe est trop long.' });
    },
    {
      submission: {
        action: (field) => this.logIn(field),
        onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  private async logIn(field: FieldTree<LoginModel>): Promise<undefined> {
    this.generalError.set(null);
    const { email, password } = field().value();

    try {
      const member = await this.sessions.logIn({ email, password });
      this.session.signedIn(member);
      await this.router.navigateByUrl('/');
    } catch (error) {
      const { status } = toApiFailure(error);
      this.generalError.set(
        status === 401
          ? 'Adresse e-mail ou mot de passe incorrect.'
          : status === 429
            ? 'Trop de tentatives. Réessayez dans quelques minutes.'
            : 'La connexion n’a pas abouti. Réessayez dans un instant.',
      );
    }
    return undefined;
  }
}
