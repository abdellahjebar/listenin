/** « Ada Lovelace » → « AL » ; « Cher » → « C » ; nom vide → « ? ». Remplace la photo (story 3). */
export function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toLocaleUpperCase('fr'));
  return letters.length > 0 ? letters.join('') : '?';
}
