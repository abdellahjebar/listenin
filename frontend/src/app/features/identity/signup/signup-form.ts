import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  maxLength,
  minLength,
  required,
  validate,
  type FieldTree,
  type ValidationError,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { remixGoogleFill } from '@ng-icons/remixicon';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { AccountsApi } from '../../../core/api/accounts-api';
import { toApiFailure } from '../../../core/api/api-failure';
import { SessionStore } from '../../../core/session/session-store';

/** Règles du contrat (NewAccount) et de l'ADR 0006, reprises pour répondre sans attendre l'API. */
export const PASSWORD_MIN = 15;
export const PASSWORD_MAX = 128;

interface SignupModel {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

/**
 * Formulaire du bloc Spartan « signup-two-column », contenu adapté à ListenIn.
 * Ajout au bloc : l'acceptation des conditions d'utilisation, exigée par l'API (invariant 7).
 */
@Component({
  selector: 'app-signup-form',
  imports: [
    FormRoot,
    FormField,
    RouterLink,
    NgIcon,
    HlmFieldImports,
    HlmInputImports,
    HlmButtonImports,
    HlmCheckboxImports,
    HlmSpinnerImports,
  ],
  providers: [provideIcons({ remixGoogleFill })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formRoot]="form" novalidate>
      <hlm-field-group class="gap-4">
        <div class="flex flex-col items-center gap-1 text-center">
          <h1 class="text-2xl font-bold">Créer votre compte</h1>
          <p class="text-muted-foreground text-sm text-balance">
            Remplissez le formulaire pour rejoindre ListenIn
          </p>
        </div>

        @if (generalError(); as message) {
          <p
            role="alert"
            class="border-destructive/50 text-destructive rounded-lg border px-3 py-2 text-sm"
          >
            {{ message }}
          </p>
        }

        <!--
          Chaque message (aide ou erreur) tient sur la ligne du libellé, à droite : afficher une
          erreur ne change pas la hauteur du formulaire, qui ne défile jamais.
        -->
        <hlm-field>
          <div class="flex items-baseline justify-between gap-2">
            <label hlmFieldLabel for="name">Nom</label>
            @if (form.name().errors()[0]; as error) {
              <hlm-field-error [validator]="error.kind" class="text-xs">{{
                error.message
              }}</hlm-field-error>
            }
          </div>
          <input
            hlmInput
            type="text"
            id="name"
            autocomplete="name"
            placeholder="Ada Lovelace"
            [formField]="form.name"
          />
        </hlm-field>

        <hlm-field>
          <div class="flex items-baseline justify-between gap-2">
            <label hlmFieldLabel for="email">Adresse e-mail</label>
            @if (form.email().errors()[0]; as error) {
              <hlm-field-error [validator]="error.kind" class="text-xs">{{
                error.message
              }}</hlm-field-error>
            }
          </div>
          <input
            hlmInput
            type="email"
            id="email"
            autocomplete="email"
            placeholder="vous@exemple.com"
            [formField]="form.email"
          />
        </hlm-field>

        <hlm-field>
          <div class="flex items-baseline justify-between gap-2">
            <label hlmFieldLabel for="password">Mot de passe</label>
            @if (form.password().touched() && form.password().invalid()) {
              @if (form.password().errors()[0]; as error) {
                <hlm-field-error [validator]="error.kind" class="text-xs">{{
                  error.message
                }}</hlm-field-error>
              }
            } @else {
              <span hlmFieldDescription class="text-xs">{{ passwordMin }} caractères min.</span>
            }
          </div>
          <input
            hlmInput
            type="password"
            id="password"
            autocomplete="new-password"
            [formField]="form.password"
          />
        </hlm-field>

        <hlm-field>
          <div class="flex items-baseline justify-between gap-2">
            <label hlmFieldLabel for="confirmPassword">Confirmer le mot de passe</label>
            @if (form.confirmPassword().touched() && form.confirmPassword().errors()[0]; as error) {
              <hlm-field-error [validator]="error.kind" class="text-xs">{{
                error.message
              }}</hlm-field-error>
            }
          </div>
          <input
            hlmInput
            type="password"
            id="confirmPassword"
            autocomplete="new-password"
            [formField]="form.confirmPassword"
          />
        </hlm-field>

        <hlm-field orientation="horizontal">
          <hlm-checkbox inputId="acceptTerms" [formField]="form.acceptTerms" />
          <label hlmFieldLabel class="font-normal" for="acceptTerms">
            J'accepte les conditions d'utilisation
          </label>
          @if (form.acceptTerms().touched() && form.acceptTerms().errors()[0]; as error) {
            <hlm-field-error class="ml-auto text-xs">{{ error.message }}</hlm-field-error>
          }
        </hlm-field>

        <hlm-field>
          <button hlmBtn type="submit" [disabled]="form().submitting()">
            @if (form().submitting()) {
              <hlm-spinner aria-label="Création du compte en cours" />
              Création du compte…
            } @else {
              Créer mon compte
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
            Déjà membre ?
            <a routerLink="/connexion">Se connecter</a>
          </p>
        </hlm-field>
      </hlm-field-group>
    </form>
  `,
})
export class SignupForm {
  private readonly accounts = inject(AccountsApi);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  protected readonly passwordMin = PASSWORD_MIN;

  /** Erreur qui ne concerne aucun champ (trop de tentatives, serveur injoignable…). */
  protected readonly generalError = signal<string | null>(null);

  protected readonly model = signal<SignupModel>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  readonly form = form(
    this.model,
    (path) => {
      required(path.name, { message: 'Obligatoire' });
      validate(path.name, ({ value }) =>
        value() !== '' && value().trim() === '' ? { kind: 'blank', message: 'Obligatoire' } : null,
      );
      maxLength(path.name, 100, { message: '100 caractères max.' });

      required(path.email, { message: 'Obligatoire' });
      email(path.email, { message: 'Adresse invalide' });
      maxLength(path.email, 254, { message: 'Adresse trop longue' });

      required(path.password, { message: 'Obligatoire' });
      minLength(path.password, PASSWORD_MIN, {
        message: `${PASSWORD_MIN} caractères min.`,
      });
      maxLength(path.password, PASSWORD_MAX, {
        message: `${PASSWORD_MAX} caractères max.`,
      });

      required(path.confirmPassword, { message: 'Obligatoire' });
      validate(path.confirmPassword, ({ value, valueOf }) =>
        value() !== '' && value() !== valueOf(path.password)
          ? { kind: 'passwordMismatch', message: 'Ne correspond pas' }
          : null,
      );

      validate(path.acceptTerms, ({ value }) =>
        value() ? null : { kind: 'required', message: 'Obligatoire' },
      );
    },
    {
      submission: {
        action: (field) => this.register(field),
        // Champs invalides : le focus va au premier, pour le clavier et les lecteurs d'écran.
        onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  private async register(
    field: FieldTree<SignupModel>,
  ): Promise<ValidationError.WithOptionalFieldTree[] | undefined> {
    this.generalError.set(null);
    const { name, email, password } = field().value();

    try {
      const member = await this.accounts.create({ name, email, password, acceptTerms: true });
      this.session.signedIn(member);
      await this.router.navigateByUrl('/');
      return undefined;
    } catch (error) {
      const failure = toApiFailure(error);

      if (failure.status === 409) {
        return [
          {
            kind: 'server',
            message: 'Déjà utilisée',
            fieldTree: field.email,
          },
        ];
      }
      if (failure.status === 400) {
        const fields: Partial<Record<string, FieldTree<unknown>>> = {
          name: field.name,
          email: field.email,
          password: field.password,
          acceptTerms: field.acceptTerms,
        };
        const errors = failure.details.flatMap((detail) => {
          const target = fields[detail.target];
          return target
            ? [{ kind: 'server', message: 'Refusé par le serveur', fieldTree: target }]
            : [];
        });
        if (errors.length > 0) {
          return errors;
        }
      }

      this.generalError.set(
        failure.status === 429
          ? 'Trop de tentatives. Réessayez dans quelques minutes.'
          : 'L’inscription n’a pas abouti. Réessayez dans un instant.',
      );
      return undefined;
    }
  }
}
