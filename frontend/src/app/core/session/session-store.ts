import { computed, Injectable, signal } from '@angular/core';
import type { Account } from '../api/accounts-api';

/**
 * Le membre connecté, tel que l'application l'affiche. La session elle-même vit côté serveur
 * (cookie HttpOnly, ADR 0006) : l'application ne voit ni ne stocke jamais son numéro.
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly member = signal<Account | null>(null);

  readonly currentMember = this.member.asReadonly();
  readonly isSignedIn = computed(() => this.member() !== null);

  signedIn(member: Account): void {
    this.member.set(member);
  }
}
