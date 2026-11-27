import type { components } from '../api/schema';

export type Instrument = components['schemas']['Instrument'];
export type Genre = components['schemas']['Genre'];

/**
 * Libellés français des listes fermées du contrat (ADR 0011). Le type `Record<Instrument, …>`
 * rend la liste complète obligatoire : un code ajouté au contrat sans libellé fait échouer la
 * compilation. L'ordre suit les familles, celui de l'affichage.
 */
export const INSTRUMENT_LABELS: Record<Instrument, string> = {
  'lead-vocals': 'Chant',
  'backing-vocals': 'Chœurs',
  mc: 'Rap (MC)',
  beatbox: 'Beatbox',
  'acoustic-guitar': 'Guitare acoustique',
  'electric-guitar': 'Guitare électrique',
  'classical-guitar': 'Guitare classique',
  'bass-guitar': 'Basse électrique',
  'double-bass': 'Contrebasse',
  violin: 'Violon',
  viola: 'Alto',
  cello: 'Violoncelle',
  harp: 'Harpe',
  ukulele: 'Ukulélé',
  banjo: 'Banjo',
  mandolin: 'Mandoline',
  oud: 'Oud',
  piano: 'Piano',
  keyboard: 'Clavier',
  organ: 'Orgue',
  synthesizer: 'Synthétiseur',
  accordion: 'Accordéon',
  drums: 'Batterie',
  percussion: 'Percussions',
  cajon: 'Cajón',
  djembe: 'Djembé',
  vibraphone: 'Vibraphone',
  saxophone: 'Saxophone',
  trumpet: 'Trompette',
  trombone: 'Trombone',
  'french-horn': 'Cor',
  tuba: 'Tuba',
  flute: 'Flûte',
  clarinet: 'Clarinette',
  harmonica: 'Harmonica',
  composition: 'Composition',
  beatmaking: 'Beatmaking',
  production: 'Production',
  dj: 'DJ',
  'sound-engineering': 'Ingénierie du son',
};

export const GENRE_LABELS: Record<Genre, string> = {
  rock: 'Rock',
  pop: 'Pop',
  indie: 'Indé',
  metal: 'Metal',
  punk: 'Punk',
  jazz: 'Jazz',
  blues: 'Blues',
  funk: 'Funk',
  soul: 'Soul',
  rnb: 'R&B',
  gospel: 'Gospel',
  'hip-hop': 'Hip-hop',
  electronic: 'Électro',
  house: 'House',
  techno: 'Techno',
  reggae: 'Reggae',
  afrobeats: 'Afrobeats',
  latin: 'Musiques latines',
  rai: 'Raï',
  world: 'Musiques du monde',
  folk: 'Folk',
  country: 'Country',
  chanson: 'Chanson française',
  classical: 'Classique',
  'film-score': 'Musique de film',
};

export interface CatalogOption {
  code: string;
  label: string;
}

const toOptions = (labels: Record<string, string>): CatalogOption[] =>
  Object.entries(labels).map(([code, label]) => ({ code, label }));

export const INSTRUMENT_OPTIONS = toOptions(INSTRUMENT_LABELS);
export const GENRE_OPTIONS = toOptions(GENRE_LABELS);

/** Au plus 10 instruments et 10 genres par profil (contrat, ADR 0011). */
export const MAX_TAGS = 10;
