import { initials } from './initials';

describe('initials (story 3 : les initiales remplacent la photo)', () => {
  it.each([
    ['Ada Lovelace', 'AL'],
    ['Cher', 'C'],
    ['  nina   simone  ', 'NS'],
    ['Jean Paul Gaultier', 'JP'],
    ['élodie frégé', 'ÉF'],
    ['', '?'],
  ])('%s → %s', (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});
