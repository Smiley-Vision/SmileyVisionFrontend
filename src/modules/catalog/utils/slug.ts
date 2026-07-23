/**
 * Generic, accent-insensitive slugifier used to turn a category name into
 * a URL segment (and back, by comparing against every known category).
 * Deliberately not a hardcoded per-category-name lookup, so new categories
 * added in the backend work without a frontend change.
 */
export function slugify(value: string): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
}
