import { computed, inject, Injectable, signal } from '@angular/core';
import type { Account } from '../api/accounts-api';
import { toApiFailure } from '../api/api-failure';
import { SessionsApi } from '../api/sessions-api';

/**
 * Le membre connecté, tel que l'application l'affiche. La session elle-même vit côté serveur
 * (cookie HttpOnly, ADR 0006) : l'application ne voit ni ne stocke jamais son numéro.
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly sessions = inject(SessionsApi);
  private readonly member = signal<Account | null>(null);

  readonly currentMember = this.member.asReadonly();
  readonly isSignedIn = computed(() => this.member() !== null);

  signedIn(member: Account): void {
    this.member.set(member);
  }

  /**
   * Au démarrage : demande à l'API qui est connecté. Sans session (401), injoignable ou en
   * erreur, l'application démarre en visiteur ; elle ne bloque jamais sur cette question.
   */
  async restore(): Promise<void> {
    try {
      this.member.set(await this.sessions.current());
    } catch (error) {
      this.member.set(null);
      const failure = toApiFailure(error);
      if (failure.status !== 401) {
        // 401 est le cas normal d'un visiteur ; le reste mérite une trace pour le diagnostic.
        console.warn('Session non vérifiée au démarrage', failure.status, failure.code);
      }
    }
  }

  /** Détruit la session côté serveur ; l'affichage repasse en visiteur dans tous les cas. */
  async signOut(): Promise<void> {
    try {
      await this.sessions.logOut();
    } finally {
      this.member.set(null);
    }
  }
}
