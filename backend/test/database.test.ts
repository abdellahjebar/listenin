import { describe, expect, it } from 'vitest';
import { ensureIndexes, mongoose } from '../src/database.js';
import { useTestDatabase } from './helpers/database.js';

useTestDatabase();

interface Sample {
  email: string;
  name: string;
}

// Un modèle d'essai, propre à ce fichier : il vérifie les réglages globaux, pas un module.
const SampleModel = mongoose.model<Sample>(
  'Sample',
  new mongoose.Schema<Sample>({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
  }),
);

describe('réglages de sécurité de Mongoose', () => {
  it('neutralise un opérateur MongoDB glissé dans un filtre (injection)', async () => {
    await SampleModel.create({ email: 'ada@example.com', name: 'Ada' });

    // Ce que produirait un corps JSON { "email": { "$ne": "" } } passé tel quel à la requête :
    // sans protection, il trouverait n'importe quel compte. Ici, l'objet est traité comme une
    // valeur à comparer, qui n'est pas une chaîne : la requête est refusée.
    const fromRequest = JSON.parse('{ "$ne": "" }') as unknown as string;

    await expect(SampleModel.findOne({ email: fromRequest })).rejects.toThrow(
      /Cast to string failed/,
    );
  });

  it('refuse un filtre sur un champ inconnu au lieu de renvoyer tous les documents', async () => {
    await SampleModel.create({ email: 'ada@example.com', name: 'Ada' });

    await expect(SampleModel.find({ emial: 'x' } as object)).rejects.toThrow();
  });

  it('refuse d’enregistrer un champ inconnu', async () => {
    await expect(
      SampleModel.create({ email: 'ada@example.com', name: 'Ada', admin: true } as Sample),
    ).rejects.toThrow();
  });

  it('crée les index déclarés : l’unicité est garantie par la base', async () => {
    await ensureIndexes();
    await SampleModel.create({ email: 'ada@example.com', name: 'Ada' });

    await expect(SampleModel.create({ email: 'ada@example.com', name: 'Autre' })).rejects.toThrow(
      /duplicate key/,
    );
  });
});
