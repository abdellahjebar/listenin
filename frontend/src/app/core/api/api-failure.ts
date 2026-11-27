import { HttpErrorResponse } from '@angular/common/http';
import type { components } from './schema';

type ErrorBody = components['schemas']['Error'];

/** Une erreur de l'API, au format commun du contrat (ADR 0007), prête à être affichée. */
export interface ApiFailure {
  /** Statut HTTP ; 0 si le serveur n'a pas répondu. */
  status: number;
  code: string;
  details: { target: string; message: string }[];
}

export function toApiFailure(error: unknown): ApiFailure {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as Partial<ErrorBody> | null;
    return {
      status: error.status,
      code: body?.error?.code ?? 'Unknown',
      details: body?.error?.details ?? [],
    };
  }
  return { status: 0, code: 'Unknown', details: [] };
}
