import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Account } from './accounts-api';
import type { components } from './schema';

export type Credentials = components['schemas']['Credentials'];

/** Sessions : /api/sessions. Le numéro de session reste dans un cookie HttpOnly (ADR 0006). */
@Injectable({ providedIn: 'root' })
export class SessionsApi {
  private readonly http = inject(HttpClient);

  logIn(credentials: Credentials): Promise<Account> {
    return firstValueFrom(this.http.post<Account>('/api/sessions', credentials));
  }

  current(): Promise<Account> {
    return firstValueFrom(this.http.get<Account>('/api/sessions/current'));
  }

  logOut(): Promise<void> {
    return firstValueFrom(this.http.delete<void>('/api/sessions/current'));
  }
}
