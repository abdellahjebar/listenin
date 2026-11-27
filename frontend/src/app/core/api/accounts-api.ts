import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { components } from './schema';

export type NewAccount = components['schemas']['NewAccount'];
export type Account = components['schemas']['Account'];

/** Comptes : POST /api/accounts. La session est posée par l'API dans un cookie HttpOnly. */
@Injectable({ providedIn: 'root' })
export class AccountsApi {
  private readonly http = inject(HttpClient);

  create(account: NewAccount): Promise<Account> {
    return firstValueFrom(this.http.post<Account>('/api/accounts', account));
  }
}
