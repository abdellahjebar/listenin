import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { SessionStore } from './session-store';

/** Page réservée aux membres : un visiteur va à la connexion, puis revient ici. */
export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(SessionStore).isSignedIn()) {
    return true;
  }
  return inject(Router).createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
};

/** Pages des visiteurs (accueil, connexion, inscription) : un membre va sur « Découvrir ». */
export const guestGuard: CanActivateFn = () =>
  inject(SessionStore).isSignedIn() ? inject(Router).createUrlTree(['/decouvrir']) : true;

/**
 * Adresse de retour après la connexion, si elle est interne à ListenIn. Une adresse externe ou
 * « //autre-site » est ignorée : sinon, un lien piégé pourrait renvoyer vers un faux site.
 */
export function safeReturnUrl(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/decouvrir';
}
