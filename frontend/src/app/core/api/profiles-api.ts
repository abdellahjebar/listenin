import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { components } from './schema';

export type Profile = components['schemas']['Profile'];
export type ProfileUpdate = components['schemas']['ProfileUpdate'];

/** Profils : /api/profiles (stories 3, 4, 5). */
@Injectable({ providedIn: 'root' })
export class ProfilesApi {
  private readonly http = inject(HttpClient);

  getMine(): Promise<Profile> {
    return firstValueFrom(this.http.get<Profile>('/api/profiles/me'));
  }

  saveMine(update: ProfileUpdate): Promise<Profile> {
    return firstValueFrom(this.http.put<Profile>('/api/profiles/me', update));
  }

  get(memberId: string): Promise<Profile> {
    return firstValueFrom(this.http.get<Profile>(`/api/profiles/${memberId}`));
  }
}
