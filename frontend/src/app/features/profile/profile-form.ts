import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  maxLength,
  required,
  validate,
  type FieldTree,
  type ValidationError,
} from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { toApiFailure } from '../../core/api/api-failure';
import { type Profile, type ProfileUpdate, ProfilesApi } from '../../core/api/profiles-api';
import { GENRE_OPTIONS, INSTRUMENT_OPTIONS, MAX_TAGS } from '../../core/catalog/catalog';
import { TagPicker } from '../../shared/ui/tag-picker';

export const BIO_MAX = 1000;

interface ProfileModel {
  name: string;
  instruments: string[];
  genres: string[];
  city: string;
  bio: string;
  contact: string;
}

const HTTPS_URL = /^https:\/\/[^\s/$.?#].[^\s]*$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Formulaire du profil (stories 3, 4), partagé par la Dialog « Modifier mon profil » et la page
 * « Complétez votre profil ». Règles reprises du contrat ; erreurs sur la ligne du libellé.
 */
@Component({
  selector: 'app-profile-form',
  imports: [
    FormRoot,
    FormField,
    HlmFieldImports,
    HlmInputImports,
    HlmTextareaImports,
    HlmButtonImports,
    HlmSpinnerImports,
    TagPicker,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formRoot]="form" novalidate>
      <hlm-field-group class="gap-4">
        @if (generalError(); as message) {
          <p
            role="alert"
            class="border-destructive/50 text-destructive rounded-lg border px-3 py-2 text-sm"
          >
            {{ message }}
          </p>
        }

        <div class="grid gap-4 sm:grid-cols-2">
          <hlm-field>
            <div class="flex items-baseline justify-between gap-2">
              <label hlmFieldLabel for="profile-name">Nom</label>
              @if (form.name().errors()[0]; as error) {
                <hlm-field-error [validator]="error.kind" class="text-xs">{{
                  error.message
                }}</hlm-field-error>
              }
            </div>
            <input hlmInput id="profile-name" autocomplete="name" [formField]="form.name" />
          </hlm-field>

          <hlm-field>
            <div class="flex items-baseline justify-between gap-2">
              <label hlmFieldLabel for="profile-city">Ville</label>
              @if (form.city().errors()[0]; as error) {
                <hlm-field-error [validator]="error.kind" class="text-xs">{{
                  error.message
                }}</hlm-field-error>
              }
            </div>
            <input
              hlmInput
              id="profile-city"
              autocomplete="address-level2"
              placeholder="Nice"
              [formField]="form.city"
            />
          </hlm-field>
        </div>

        <hlm-field>
          <div class="flex items-baseline justify-between gap-2">
            <label hlmFieldLabel for="profile-instruments">Instruments</label>
            @if (form.instruments().errors()[0]; as error) {
              <hlm-field-error [validator]="error.kind" class="text-xs">{{
                error.message
              }}</hlm-field-error>
            } @else {
              <span hlmFieldDescription class="text-xs">{{ maxTags }} max.</span>
            }
          </div>
          <app-tag-picker
            inputId="profile-instruments"
            placeholder="Guitare, batterie…"
            [options]="instrumentOptions"
            [field]="form.instruments"
          />
        </hlm-field>

        <hlm-field>
          <div class="flex items-baseline justify-between gap-2">
            <label hlmFieldLabel for="profile-genres">Genres</label>
            @if (form.genres().errors()[0]; as error) {
              <hlm-field-error [validator]="error.kind" class="text-xs">{{
                error.message
              }}</hlm-field-error>
            } @else {
              <span hlmFieldDescription class="text-xs">{{ maxTags }} max.</span>
            }
          </div>
          <app-tag-picker
            inputId="profile-genres"
            placeholder="Jazz, rock…"
            [options]="genreOptions"
            [field]="form.genres"
          />
        </hlm-field>

        <hlm-field>
          <div class="flex items-baseline justify-between gap-2">
            <label hlmFieldLabel for="profile-bio">Présentation</label>
            @if (form.bio().errors()[0]; as error) {
              <hlm-field-error [validator]="error.kind" class="text-xs">{{
                error.message
              }}</hlm-field-error>
            } @else {
              <span hlmFieldDescription class="text-xs tabular-nums" aria-live="polite">
                {{ form.bio().value().length }}/{{ bioMax }}
              </span>
            }
          </div>
          <textarea
            hlmTextarea
            id="profile-bio"
            rows="3"
            class="resize-none"
            placeholder="Ce que vous jouez, ce que vous cherchez…"
            [formField]="form.bio"
          ></textarea>
        </hlm-field>

        <hlm-field>
          <div class="flex items-baseline justify-between gap-2">
            <label hlmFieldLabel for="profile-contact">Contact</label>
            @if (form.contact().errors()[0]; as error) {
              <hlm-field-error [validator]="error.kind" class="text-xs">{{
                error.message
              }}</hlm-field-error>
            } @else {
              <span hlmFieldDescription class="text-xs">Lien https:// ou adresse e-mail</span>
            }
          </div>
          <input
            hlmInput
            id="profile-contact"
            placeholder="https://instagram.com/…"
            [formField]="form.contact"
          />
        </hlm-field>

        <div class="flex justify-end gap-2">
          <button hlmBtn variant="outline" type="button" (click)="cancelled.emit()">
            {{ cancelLabel() }}
          </button>
          <button hlmBtn type="submit" [disabled]="form().submitting()">
            @if (form().submitting()) {
              <hlm-spinner aria-label="Enregistrement en cours" />
              Enregistrement…
            } @else {
              Enregistrer
            }
          </button>
        </div>
      </hlm-field-group>
    </form>
  `,
})
export class ProfileForm {
  private readonly profiles = inject(ProfilesApi);

  /** Valeurs de départ : le profil existant, ou au moins le nom donné à l'inscription. */
  readonly initial = input.required<ProfileUpdate>();
  readonly cancelLabel = input('Annuler');
  readonly saved = output<Profile>();
  readonly cancelled = output();

  protected readonly instrumentOptions = INSTRUMENT_OPTIONS;
  protected readonly genreOptions = GENRE_OPTIONS;
  protected readonly maxTags = MAX_TAGS;
  protected readonly bioMax = BIO_MAX;
  protected readonly generalError = signal<string | null>(null);

  protected readonly model = signal<ProfileModel>({
    name: '',
    instruments: [],
    genres: [],
    city: '',
    bio: '',
    contact: '',
  });

  constructor() {
    effect(() => {
      const initial = this.initial();
      this.model.set({ ...initial, contact: initial.contact ?? '' });
    });
  }

  readonly form = form(
    this.model,
    (path) => {
      required(path.name, { message: 'Obligatoire' });
      validate(path.name, ({ value }) =>
        value() !== '' && value().trim() === '' ? { kind: 'blank', message: 'Obligatoire' } : null,
      );
      maxLength(path.name, 100, { message: '100 caractères max.' });
      maxLength(path.city, 100, { message: '100 caractères max.' });
      maxLength(path.instruments, MAX_TAGS, { message: `${MAX_TAGS} max.` });
      maxLength(path.genres, MAX_TAGS, { message: `${MAX_TAGS} max.` });
      maxLength(path.bio, BIO_MAX, { message: `${BIO_MAX} caractères max.` });
      validate(path.contact, ({ value }) => {
        const contact = value().trim();
        return contact === '' || HTTPS_URL.test(contact) || EMAIL.test(contact)
          ? null
          : { kind: 'contact', message: 'Lien https:// ou adresse e-mail' };
      });
    },
    {
      submission: {
        action: (field) => this.save(field),
        onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  private async save(
    field: FieldTree<ProfileModel>,
  ): Promise<ValidationError.WithOptionalFieldTree[] | undefined> {
    this.generalError.set(null);
    const value = field().value();
    const update = {
      name: value.name.trim(),
      // Le Combobox peut rendre null quand plus rien n'est choisi : c'est une liste vide.
      instruments: value.instruments ?? [],
      genres: value.genres ?? [],
      city: value.city.trim(),
      bio: value.bio.trim(),
      contact: value.contact.trim() === '' ? null : value.contact.trim(),
    } as ProfileUpdate;

    try {
      this.saved.emit(await this.profiles.saveMine(update));
      return undefined;
    } catch (error) {
      const failure = toApiFailure(error);
      if (failure.status === 400) {
        const fields: Partial<Record<string, FieldTree<unknown>>> = {
          name: field.name,
          instruments: field.instruments,
          genres: field.genres,
          city: field.city,
          bio: field.bio,
          contact: field.contact,
        };
        const errors = failure.details.flatMap((detail) => {
          const target = fields[detail.target.split('.')[0]!];
          return target ? [{ kind: 'server', message: 'Refusé', fieldTree: target }] : [];
        });
        if (errors.length > 0) {
          return errors;
        }
      }
      this.generalError.set('L’enregistrement n’a pas abouti. Réessayez dans un instant.');
      return undefined;
    }
  }
}
