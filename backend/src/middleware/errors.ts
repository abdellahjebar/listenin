import type { ErrorRequestHandler, RequestHandler, Response } from 'express';

/** Format commun à toutes les erreurs, décrit dans openapi.yaml (ADR 0007). */
export interface ErrorBody {
  error: {
    code: string;
    message: string;
    details?: { target: string; message: string }[];
  };
}

/**
 * Erreur prévue, levée par le code de l'API (règle métier, protection) : son statut, son code et
 * son message sont renvoyés tels quels au client.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const NOT_FOUND = { code: 'NotFound', message: 'Ressource inconnue' };

/** Erreurs client connues : statut HTTP vers code stable et message. */
const CLIENT_ERRORS: Partial<Record<number, { code: string; message: string }>> = {
  400: { code: 'BadRequest', message: 'Requête invalide' },
  404: NOT_FOUND,
  405: { code: 'MethodNotAllowed', message: 'Méthode non autorisée sur cette ressource' },
  413: { code: 'PayloadTooLarge', message: 'Corps de requête trop volumineux' },
  415: { code: 'UnsupportedMediaType', message: 'Type de contenu non pris en charge' },
};

/**
 * Forme commune aux erreurs levées par express-openapi-validator et par express.json :
 * un statut HTTP, parfois la liste des champs en cause.
 */
interface HttpErrorLike {
  status: number;
  type?: string;
  errors?: { path: string; message: string }[];
  headers?: { Allow?: string };
}

function isClientError(error: unknown): error is HttpErrorLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number' &&
    error.status >= 400 &&
    error.status < 500
  );
}

/** « /body/email » devient « email », « /body/address/city » devient « address.city ». */
function toTarget(path: string): string {
  return path
    .replace(/^\/?(body|query|params|headers|cookies)\/?/, '')
    .split('/')
    .filter(Boolean)
    .join('.');
}

function send(res: Response, status: number, body: ErrorBody): void {
  res.status(status).json(body);
}

export const notFound: RequestHandler = (_req, res) => {
  send(res, 404, { error: NOT_FOUND });
};

// Express reconnaît un gestionnaire d'erreurs à ses quatre paramètres.
export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof ApiError) {
    send(res, error.status, { error: { code: error.code, message: error.message } });
    return;
  }

  if (isClientError(error)) {
    if (error.status === 400 && error.type === 'entity.parse.failed') {
      send(res, 400, {
        error: { code: 'InvalidJson', message: 'Corps de requête JSON illisible' },
      });
      return;
    }

    if (error.status === 400 && error.errors?.length) {
      send(res, 400, {
        error: {
          code: 'ValidationError',
          message: 'La requête ne respecte pas le contrat',
          details: error.errors.map((item) => ({
            target: toTarget(item.path),
            message: item.message,
          })),
        },
      });
      return;
    }

    if (error.status === 405 && error.headers?.Allow) {
      res.setHeader('Allow', error.headers.Allow);
    }

    send(res, error.status, {
      error: CLIENT_ERRORS[error.status] ?? { code: 'ClientError', message: 'Requête refusée' },
    });
    return;
  }

  // Tout le reste est un défaut du serveur : on le journalise, sans rien en révéler au client.
  req.log.error({ err: error }, 'Erreur non gérée');
  send(res, 500, { error: { code: 'InternalError', message: 'Erreur interne du serveur' } });
};
