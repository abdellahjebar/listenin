import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { FormField, type FieldTree } from '@angular/forms/signals';
import { HlmComboboxImports } from '@spartan-ng/helm/combobox';
import type { CatalogOption } from '../../core/catalog/catalog';

/**
 * Choix multiple dans une liste fermée, avec recherche pendant la frappe (docs/INTERFACE.md).
 * Combobox multiple de Spartan lié directement au champ du formulaire ([formField]), comme dans
 * sa documentation : chaque choix devient une étiquette retirable ; Entrée choisit la première
 * suggestion ; la recherche ignore les accents et les majuscules (« electro » trouve « Électro »).
 *
 * Chaque croix porte un nom pour les lecteurs d'écran : « Retirer Piano ».
 *
 * Écart voulu au comportement de Spartan : Échap, liste fermée, ne vide plus tout le champ.
 * Pour un choix multiple, on perdrait d'un coup tous ses choix. Retirer un choix : sa croix,
 * ou Retour arrière dans le champ vide. Choisir efface la recherche ; la frappe suivante
 * rouvre la liste.
 */
@Component({
  selector: 'app-tag-picker',
  imports: [HlmComboboxImports, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-combobox-multiple
      [formField]="field()"
      autoHighlight
      [itemToString]="toLabel"
      [filterOptions]="{ sensitivity: 'base' }"
    >
      <hlm-combobox-chips>
        <ng-template hlmComboboxValues let-values>
          @for (code of values; track code) {
            <hlm-combobox-chip [value]="code" [removeLabel]="'Retirer ' + toLabel(code)">{{
              toLabel(code)
            }}</hlm-combobox-chip>
          }
        </ng-template>
        <input
          hlmComboboxChipInput
          [id]="inputId()"
          [placeholder]="(field()().value() ?? []).length === 0 ? placeholder() : ''"
        />
      </hlm-combobox-chips>
      <hlm-combobox-content *hlmComboboxPortal>
        <hlm-combobox-empty>Aucun résultat.</hlm-combobox-empty>
        <div hlmComboboxList>
          @for (option of options(); track option.code) {
            <hlm-combobox-item [value]="option.code">{{ option.label }}</hlm-combobox-item>
          }
        </div>
      </hlm-combobox-content>
    </hlm-combobox-multiple>
  `,
})
export class TagPicker {
  readonly field = input.required<FieldTree<string[]>>();
  readonly options = input.required<CatalogOption[]>();
  readonly inputId = input.required<string>();
  readonly placeholder = input('Rechercher…');

  private readonly labels = computed(
    () => new Map(this.options().map((option) => [option.code, option.label])),
  );

  protected readonly toLabel = (code: string): string => this.labels().get(code) ?? code;

  constructor() {
    // Écoute en phase de capture : passe avant le gestionnaire de Spartan, posé sur le champ.
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const guardEscape = (event: KeyboardEvent): void => {
      const input = event.target as HTMLElement | null;
      if (event.key === 'Escape' && input?.getAttribute('aria-expanded') !== 'true') {
        event.stopPropagation();
      }
    };
    host.addEventListener('keydown', guardEscape, { capture: true });
    inject(DestroyRef).onDestroy(() =>
      host.removeEventListener('keydown', guardEscape, { capture: true }),
    );
  }
}
