import { EntityMetadata } from 'typeorm';

export function buildSelect<T>(
  metadata: EntityMetadata,
  unSelect: (keyof T)[],
): (keyof T)[] {
  const allColumns = metadata.columns.map((col) => col.propertyName as keyof T);
  return allColumns.filter((col) => !unSelect.includes(col));
}
