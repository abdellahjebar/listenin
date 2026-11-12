import type { ErrorRequestHandler, RequestHandler } from 'express';

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ message: 'Ressource inconnue' });
};

// Express reconnaît un gestionnaire d'erreurs à ses quatre paramètres.
export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  req.log.error({ err: error }, 'Erreur non gérée');
  res.status(500).json({ message: 'Erreur interne du serveur' });
};
